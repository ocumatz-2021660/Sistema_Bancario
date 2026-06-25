import { getUserRoleNames } from '../helpers/role-db.js';
import { ADMIN_ROLE } from '../helpers/role-constants.js';

export const isAdmin = async (req, res, next) => {
  try {
    const currentUserId = req.userId;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado. Token requerido.',
      });
    }
    // Si validateJWT ya cargó los roles en req.user, los usamos directo (evita otra query)
    // Si no, los consultamos desde la BD
    const roles =
      req.user?.UserRoles?.map((ur) => ur.Role?.Name).filter(Boolean).length > 0
        ? req.user.UserRoles.map((ur) => ur.Role?.Name).filter(Boolean)
        : await getUserRoleNames(currentUserId);

    const userIsAdmin = roles.includes(ADMIN_ROLE);

    if (!userIsAdmin) {
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