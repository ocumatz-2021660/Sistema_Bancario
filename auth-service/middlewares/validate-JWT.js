import { verifyJWT } from '../helpers/generate-jwt.js';
import { findUserById } from '../helpers/user-db.js';

/**
 * Middleware para validar JWT
 */
export const validateJWT = async (req, res, next) => {
  try {
    let token =
      req.header('x-token') ||
      req.header('authorization') ||
      req.body.token ||
      req.query.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No hay token en la petición',
      });
    }

    // Limpiar el token si viene con Bearer
    token = token.replace(/^Bearer\s+/, '');

    // Verificar el token
    const decoded = await verifyJWT(token);

    // Buscar el usuario por ID (decoded.sub es string)
    const user = await findUserById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido - Usuario no existe',
      });
    }

    // Verificar si el usuario está activo
    if (!user.Status) {
      return res.status(423).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador.',
      });
    }

    // Agregar el usuario al request
    req.user = user;
    req.userId = user.Id.toString();

    next();
  } catch (error) {
    const messages = {
      TokenExpiredError: 'Token expirado',
      JsonWebTokenError: 'Token inválido',
    };

    console.warn(messages[error.name] || `!!!ALERTA¡¡¡ -- JWT Error: ${error.message} --`);

    return res.status(401).json({
      success: false,
      message: messages[error.name] || 'Error al verificar el token',
    });
  }
};
