import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { findUserById } from '../../helpers/user-db.js';
import {
  getUserRoleNames,
  getUsersByRole as repoGetUsersByRole,
  setUserSingleRole,
} from '../../helpers/role-db.js';
import { ALLOWED_ROLES } from '../../helpers/role-constants.js';
import { buildUserResponse } from '../../utils/user-helpers.js';
import { sequelize } from '../../configs/db.js';

export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { roleName } = req.body || {};

  // Validar que se envió un rol
  if (!roleName) {
    return res.status(400).json({
      success: false,
      message: 'El campo "roleName" es requerido.',
    });
  }

  const normalized = roleName.trim().toUpperCase();

  // Validar que el rol sea permitido
  if (!ALLOWED_ROLES.includes(normalized)) {
    return res.status(400).json({
      success: false,
      message: `Rol no permitido. Los roles válidos son: ${ALLOWED_ROLES.join(', ')}`,
    });
  }

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado.',
    });
  }

  // Evitar que un admin se cambie el rol a sí mismo por error
  if (userId === req.userId) {
    return res.status(400).json({
      success: false,
      message: 'No puedes cambiar tu propio rol.',
    });
  }

  // Aplicar el nuevo rol
  const { updatedUser } = await setUserSingleRole(user, normalized, sequelize);

  return res.status(200).json({
    success: true,
    message: `Rol actualizado a "${normalized}" exitosamente.`,
    data: buildUserResponse(updatedUser),
  });
});


export const getUserRoles = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado.',
    });
  }

  const roles = await getUserRoleNames(userId);

  return res.status(200).json({
    success: true,
    message: 'Roles obtenidos exitosamente.',
    data: { userId, roles },
  });
});

export const getUsersByRole = asyncHandler(async (req, res) => {
  const { roleName } = req.params;
  const normalized = (roleName || '').trim().toUpperCase();

  if (!ALLOWED_ROLES.includes(normalized)) {
    return res.status(400).json({
      success: false,
      message: `Rol no permitido. Los roles válidos son: ${ALLOWED_ROLES.join(', ')}`,
    });
  }

  const users = await repoGetUsersByRole(normalized);
  const payload = users.map(buildUserResponse);

  return res.status(200).json({
    success: true,
    message: `Usuarios con rol "${normalized}" obtenidos exitosamente.`,
    data: payload,
  });
});