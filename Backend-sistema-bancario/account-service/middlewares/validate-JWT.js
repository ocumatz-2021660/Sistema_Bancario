import { verifyJWT } from '../helpers/generate-jwt.js';
import { findUserById } from '../helpers/user-db.js';

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

    token = token.replace(/^Bearer\s+/, '');

    const decoded = await verifyJWT(token);

    const user = await findUserById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido - Usuario no existe',
      });
    }

    if (!user.Status) {
      return res.status(423).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador.',
      });
    }

    req.user = user;
    req.userId = user.Id.toString();

    next();
  } catch (error) {
    const messages = {
      TokenExpiredError: 'Token expirado',
      JsonWebTokenError: 'Token inválido',
    };

    console.warn(messages[error.name] || `JWT Error: ${error.message}`);

    return res.status(401).json({
      success: false,
      message: messages[error.name] || 'Error al verificar el token',
    });
  }
};
