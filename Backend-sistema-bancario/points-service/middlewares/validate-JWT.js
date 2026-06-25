import jwt from 'jsonwebtoken';
import { config } from '../configs/config.js';

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

    const decoded = jwt.verify(token, config.jwt.secret);

    req.userId = decoded.sub;
    req.userRole = decoded.role || 'USER_ROLE';

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
