import { ADMIN_ROLE } from '../helpers/role-constants.js';

export const isAdmin = async (req, res, next) => {
  try {
    const userRole = req.userRole;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado. Token requerido.',
      });
    }

    if (userRole !== ADMIN_ROLE) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere permisos de administrador.',
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware isAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al verificar permisos.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
