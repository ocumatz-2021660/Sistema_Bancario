import crypto from 'crypto';
import path from 'path';
import {
  checkUserExists,
  createNewUser,
  findUserByEmailOrUsername,
  updateEmailVerificationToken,
  markEmailAsVerified,
  findUserByEmail,
  updatePasswordResetToken,
  updateUserPassword,
  findUserByEmailVerificationToken,
  findUserByPasswordResetToken,
} from './user-db.js';
import {
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from '../utils/auth-helpers.js';
import { verifyPassword } from '../utils/password-utils.js';
import { buildUserResponse } from '../utils/user-helpers.js';
import { sendVerificationEmail } from './email-service.js';
import { generateJWT } from './generate-jwt.js';
import { uploadImage } from './cloudinary-service.js';
import { config } from '../configs/config.js';

const getExpirationTime = (timeString) => {
  const timeValue = parseInt(timeString);
  const timeUnit = timeString.replace(timeValue.toString(), '');

  switch (timeUnit) {
    case 's':
      return timeValue * 1000;
    case 'm':
      return timeValue * 60 * 1000;
    case 'h':
      return timeValue * 60 * 60 * 1000;
    case 'd':
      return timeValue * 24 * 60 * 60 * 1000;
    default:
      return 30 * 60 * 1000; // Default: 30 minutos
  }
};

export const registerUserHelper = async (userData) => {
  try {
    const { email, username, password, name, surname, phone, profilePicture } =
      userData;

    // Validation is now handled by express-validator middleware in routes
    const userExists = await checkUserExists(email, username);
    if (userExists) {
      throw new Error(
        'Ya existe un usuario con este email o nombre de usuario'
      );
    }
    let profilePictureToStore = profilePicture;
    if (profilePicture) {
      const uploadPath = config.upload.uploadPath;

      // Detectar si es un archivo local
      const isLocalFile =
        profilePicture.includes('uploads') ||
        profilePicture.includes(uploadPath) ||
        profilePicture.startsWith('./');

      if (isLocalFile) {
        try {
          // CORRECCIÓN CRÍTICA: Normalizar la ruta del archivo antes de subirlo
          // Convertir barras invertidas a barras normales
          let normalizedPath = profilePicture.replace(/\\/g, '/');
          
          // Si la ruta es relativa, convertirla a absoluta
          if (!path.isAbsolute(normalizedPath)) {
            normalizedPath = path.resolve(normalizedPath).replace(/\\/g, '/');
          }

          // Generar nombre como .NET: profile-<12chars>.ext
          const ext = path.extname(normalizedPath);
          const randomHex = crypto.randomBytes(6).toString('hex');
          const cloudinaryFileName = `profile-${randomHex}${ext}`;

          // uploadImage ahora retorna la URL completa de Cloudinary
          profilePictureToStore = await uploadImage(
            normalizedPath,
            cloudinaryFileName
          );
        } catch (err) {
          console.error(
            'Error uploading profile picture to Cloudinary during registration:',
            err
          );
          profilePictureToStore = null;
        }
      } else {
        // Si viene una URL de Cloudinary, usarla directamente
        if (profilePicture.startsWith('https://res.cloudinary.com/') ||
            profilePicture.startsWith('http://res.cloudinary.com/')) {
          profilePictureToStore = profilePicture;
        } else {
          // Si no es URL completa ni archivo local, intentar normalizar
          profilePictureToStore = null;
        }
      }
    }

    // Crear el usuario
    const newUser = await createNewUser({
      name,
      surname,
      username,
      email,
      password,
      phone,
      profilePicture: profilePictureToStore,
    });

    // Generar token de verificación de email
    const verificationToken = await generateEmailVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Guardar el token en la base de datos
    await updateEmailVerificationToken(
      newUser.Id,
      verificationToken,
      tokenExpiry
    );

    // Enviar email de verificación en background para no bloquear la respuesta
    // Si falla, se registra en consola pero no afecta la respuesta
    Promise.resolve()
      .then(() => sendVerificationEmail(email, name, verificationToken))
      .catch((err) =>
        console.error('Async email send (verification) failed:', err)
      );

    // Note: No JWT token returned in register (aligned with .NET RegisterResponseDto)
    // JWT will be generated only at login

    // RegisterResponseDto equivalent structure
    return {
      success: true,
      user: buildUserResponse(newUser),
      message:
        'Usuario registrado exitosamente. Por favor, verifica tu email para activar la cuenta.',
      emailVerificationRequired: true,
    };
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

export const loginUserHelper = async (emailOrUsername, password) => {
  try {
    // Validation is now handled by express-validator middleware in routes

    // Buscar usuario por email o username
    const user = await findUserByEmailOrUsername(emailOrUsername);

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(user.Password, password);

    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si el email está verificado
    if (!user.UserEmail || !user.UserEmail.EmailVerified) {
      throw new Error(
        'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada o reenvía el email de verificación.'
      );
    }

    // Verificar si el usuario está activo
    if (!user.Status) {
      throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
    }

    // Generate JWT with role claim
    const role = user.UserRoles?.[0]?.Role?.Name || 'USER_ROLE';
    const token = await generateJWT(user.Id.toString(), { role });

    // Calcular fecha de expiración basada en la configuración
    const expiresInMs = getExpirationTime(process.env.JWT_EXPIRES_IN || '30m');
    const expiresAt = new Date(Date.now() + expiresInMs);

    // Build compact userDetails object
    const fullUser = buildUserResponse(user);
    const userDetails = {
      id: fullUser.id,
      username: fullUser.username,
      profilePicture: fullUser.profilePicture,
      role: fullUser.role,
    };

    // AuthResponseDto equivalent structure
    return {
      success: true,
      message: 'Login exitoso',
      token,
      userDetails,
      expiresAt,
    };
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const verifyEmailHelper = async (token) => {
  try {
    // Verify simple token format (not JWT anymore, matching .NET)
    if (!token || typeof token !== 'string' || token.length < 40) {
      throw new Error('Token inválido para verificación de email');
    }

    // Find user by verification token (like .NET does)
    const user = await findUserByEmailVerificationToken(token);
    if (!user) {
      throw new Error('Usuario no encontrado o token inválido');
    }

    // Verificar que el token no haya expirado (ya se verifica en jwt.verify, pero por seguridad)
    const userEmail = user.UserEmail;
    if (!userEmail) {
      throw new Error('Registro de email no encontrado');
    }

    if (userEmail.EmailVerified) {
      throw new Error('El email ya ha sido verificado');
    }

    // Marcar el email como verificado
    await markEmailAsVerified(user.Id);

    // Enviar email de bienvenida en background (aligned with .NET)
    Promise.resolve()
      .then(async () => {
        const { sendWelcomeEmail } = await import('./email-service.js');
        return sendWelcomeEmail(user.Email, user.Name);
      })
      .catch((emailError) => {
        console.error('Async email send (welcome) failed:', emailError);
      });

    // EmailResponseDto equivalent structure
    return {
      success: true,
      message: 'Email verificado exitosamente. Ya puedes iniciar sesión.',
      data: {
        email: user.Email,
        verified: true,
      },
    };
  } catch (error) {
    console.error('Error verificando email:', error);

    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token de verificación inválido');
    } else if (error.name === 'TokenExpiredError') {
      throw new Error('Token de verificación expirado');
    }

    throw error;
  }
};

export const resendVerificationEmailHelper = async (email) => {
  try {
    const user = await findUserByEmail(email.toLowerCase());

    if (!user) {
      // EmailResponseDto equivalent structure
      return {
        success: false,
        message: 'Usuario no encontrado',
        data: { email, sent: false },
      };
    }

    // Verificar si ya está verificado
    if (user.UserEmail && user.UserEmail.EmailVerified) {
      // EmailResponseDto equivalent structure
      return {
        success: false,
        message: 'El email ya ha sido verificado',
        data: { email: user.Email, verified: true },
      };
    }

    // Generar nuevo token de verificación
    const verificationToken = await generateEmailVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Actualizar token en la base de datos
    await updateEmailVerificationToken(user.Id, verificationToken, tokenExpiry);

    // Enviar email de forma síncrona para reportar errores correctamente
    try {
      await sendVerificationEmail(user.Email, user.Name, verificationToken);
      // EmailResponseDto equivalent structure
      return {
        success: true,
        message: 'Email de verificación enviado exitosamente',
        data: { email: user.Email, sent: true },
      };
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // EmailResponseDto equivalent structure
      return {
        success: false,
        message:
          'Error al enviar el email de verificación. Por favor, intenta nuevamente más tarde.',
        data: { email: user.Email, sent: false },
      };
    }
  } catch (error) {
    console.error('Error en resendVerificationEmailHelper:', error);
    return {
      success: false,
      message: 'Error interno del servidor',
      data: { email, sent: false },
    };
  }
};

export const forgotPasswordHelper = async (email) => {
  try {
    const user = await findUserByEmail(email.toLowerCase());

    // Por seguridad, siempre devolvemos éxito aunque el usuario no exista
    if (!user) {
      // EmailResponseDto equivalent structure
      return {
        success: true,
        message: 'Si el email existe, se ha enviado un enlace de recuperación',
        data: { email, initiated: true },
      };
    }

    // Generar token de reset
    const resetToken = await generatePasswordResetToken();
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Actualizar token en la base de datos
    await updatePasswordResetToken(user.Id, resetToken, tokenExpiry);

    // Enviar email de reset
    const { sendPasswordResetEmail } = await import('./email-service.js');
    // Enviar email en background; no bloquear la respuesta
    Promise.resolve()
      .then(() => sendPasswordResetEmail(user.Email, user.Name, resetToken))
      .catch((emailError) => {
        console.error(
          `Failed to send password reset email to ${email}:`,
          emailError
        );
      });

    // EmailResponseDto equivalent structure
    return {
      success: true,
      message: 'Si el email existe, se ha enviado un enlace de recuperación',
      data: { email, initiated: true },
    };
  } catch (error) {
    console.error('Error en forgotPasswordHelper:', error);
    // Por seguridad, no revelamos errores internos
    // EmailResponseDto equivalent structure
    return {
      success: true,
      message: 'Si el email existe, se ha enviado un enlace de recuperación',
      data: { email, initiated: true },
    };
  }
};

export const resetPasswordHelper = async (token, newPassword) => {
  try {
    // Verify simple token format (not JWT anymore, matching .NET)
    if (!token || typeof token !== 'string' || token.length < 40) {
      throw new Error('Token inválido para reset de contraseña');
    }

    // Find user by password reset token (like .NET does)
    const user = await findUserByPasswordResetToken(token);
    if (!user) {
      throw new Error('Usuario no encontrado o token inválido');
    }

    // Verificar que el token no haya expirado (ya se verifica en jwt.verify, pero por seguridad)
    const userPasswordReset = user.UserPasswordReset;
    if (!userPasswordReset || !userPasswordReset.PasswordResetToken) {
      throw new Error('Token de reset inválido o ya utilizado');
    }

    // Hash de la nueva contraseña
    const { hashPassword } = await import('../utils/password-utils.js');
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña y limpiar token
    await updateUserPassword(user.Id, hashedPassword);

    // Enviar email de confirmación
    try {
      const { sendPasswordChangedEmail } = await import('./email-service.js');
      // Enviar email en background; no bloquear la respuesta
      Promise.resolve()
        .then(() => sendPasswordChangedEmail(user.Email, user.Name))
        .catch((emailError) => {
          console.error('Error sending password changed email:', emailError);
        });
    } catch (emailError) {
      console.error('Error scheduling password changed email:', emailError);
      // No fallar la operación por error de email
    }

    // EmailResponseDto equivalent structure
    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
      data: { email: user.Email, reset: true },
    };
  } catch (error) {
    console.error('Error en resetPasswordHelper:', error);

    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token de reset inválido');
    } else if (error.name === 'TokenExpiredError') {
      throw new Error('Token de reset expirado');
    }

    throw error;
  }
};