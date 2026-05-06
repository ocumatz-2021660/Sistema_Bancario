import nodemailer from 'nodemailer';
import { config } from '../configs/config.js';
 
// Configurar el transportador de email (aligned with .NET SmtpSettings)
const createTransporter = () => {
  if (!config.smtp.username || !config.smtp.password) {
    console.warn(
      'SMTP credentials not configured. Email functionality will not work.'
    );
    return null;
  }
 
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.enableSsl, // true para 465, false para 587
    auth: {
      user: config.smtp.username,
      pass: config.smtp.password,
    },
    // Evitar que las peticiones HTTP queden colgadas si SMTP no responde
    connectionTimeout: 10_000, // 10s
    greetingTimeout: 10_000, // 10s
    socketTimeout: 10_000, // 10s
    tls: {
      rejectUnauthorized: false,
    },
  });
};
 
const transporter = createTransporter();
 
export const sendVerificationEmail = async (email, name, verificationToken) => {
  if (!transporter) throw new Error('SMTP transporter not configured');
 
  try {
    const frontendUrl = config.app.frontendUrl || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
 
    const mailOptions = {
      from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Verificación de Seguridad - Registro de Cuenta',
      html: `
        <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-top: 4px solid #004a99; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Confirmación de Identidad</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">Bienvenido/a <strong>${name}</strong>,<br>Para completar el proceso de activación de su cuenta bancaria, es necesario verificar su dirección de correo electrónico.</p>
            <p  style="color: #055387; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            ${verificationUrl}
            </p>
            <p style="color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
              Copiar la url despues del signo " = ".<br>
            </p>
            <p style="color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
              Este enlace tiene una validez de 24 horas por motivos de seguridad.<br>
              Si no ha solicitado esta acción, por favor ignore este mensaje.
            </p>
          </div>
        </div>
      `,
    };
 
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};
 
export const sendPasswordResetEmail = async (email, name, resetToken) => {
  if (!transporter) throw new Error('SMTP transporter not configured');
 
  try {
    const frontendUrl = config.app.frontendUrl || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
 
    const mailOptions = {
      from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Notificación de Seguridad: Restablecimiento de Contraseña',
      html: `
        <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-top: 4px solid #d9534f; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Solicitud de Restablecimiento</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">Hola <strong>${name}</strong>,<br>Hemos recibido una solicitud para cambiar la contraseña de acceso a su banca en línea.</p>
            <p style="text-align: left; color: #555; font-size: 13px; background-color: #fdf7f7; padding: 15px; border-radius: 4px;">
              <strong>Atención:</strong> Si usted no solicitó este cambio, su cuenta podría estar en riesgo. No comparta este enlace con nadie.
            </p>
            <p style="text-align: left; color: #055387; font-size: 13px; background-color: #fdf7f7; padding: 15px; border-radius: 4px;">
              ${resetUrl}
                <br>
            </p>
            <p style="color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
              Copiar la url despues del signo " = ".<br>
            </p>
            <p style="color: #888; font-size: 12px; margin-top: 20px;">Este enlace expirará en 1 hora. <br></p>
          </div>
        </div>
      `,
    };
 
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
 
export const sendWelcomeEmail = async (email, name) => {
  if (!transporter) throw new Error('SMTP transporter not configured');
 
  try {
    const mailOptions = {
      from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Bienvenido/a a su Banca Digital',
      html: `
        <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-top: 4px solid #28a745; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">¡Registro Exitoso!</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">Estimado/a <strong>${name}</strong>,<br>Su cuenta ha sido verificada y activada correctamente.</p>
            <p style="color: #555; font-size: 15px;">Ya puede realizar operaciones y consultar sus movimientos desde nuestra plataforma digital de forma segura.</p>
            <div style="padding: 20px 0; border-top: 1px solid #eee; margin-top: 20px;">
                <p style="color: #888; font-size: 13px; margin: 0;">Gracias por depositar su confianza en nuestra institución.</p>
            </div>
          </div>
        </div>
      `,
    };
 
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};
 
export const sendPasswordChangedEmail = async (email, name) => {
  if (!transporter) throw new Error('SMTP transporter not configured');
 
  try {
    const mailOptions = {
      from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Alerta de Seguridad: Cambio de Contraseña Confirmado',
      html: `
        <div style="background-color: #f4f4f4; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-top: 4px solid #333; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Contraseña Actualizada</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: left;">
              Le informamos que la contraseña de su cuenta ha sido modificada satisfactoriamente hoy.
            </p>
            <div style="background-color: #fff3cd; border: 1px solid #ffeeba; padding: 15px; text-align: left; margin: 20px 0;">
                <p style="color: #856404; font-size: 14px; margin: 0;">
                    <strong>¿No reconoce esta actividad?</strong><br>
                    Si no realizó este cambio, comuníquese de inmediato con nuestra línea de atención al cliente para bloquear su acceso.
                </p>
            </div>
            <p style="color: #888; font-size: 12px;">Este es un mensaje automático generado por nuestro sistema de seguridad.</p>
          </div>
        </div>
      `,
    };
 
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password changed email:', error);
    throw error;
  }
};
 