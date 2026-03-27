import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { findUserById, findAllUsers } from '../../helpers/user-db.js';
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

export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, accountStatus } = req.query;

  const { users, total } = await findAllUsers({
    limit:  Number(limit),
    offset: (Number(page) - 1) * Number(limit),
    accountStatus, 
  });

  return res.status(200).json({
    success: true,
    message: 'Usuarios obtenidos exitosamente.',
    data: users.map(buildUserResponse),
    pagination: {
      currentPage:  parseInt(page),
      totalPages:   Math.ceil(total / limit),
      totalRecords: total,
      limit:        parseInt(limit),
    },
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, surname, username, phone } = req.body;

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado.',
    });
  }

  // Evitar que un admin se edite a sí mismo por esta ruta
  if (userId === req.userId) {
    return res.status(400).json({
      success: false,
      message: 'No puedes editar tu propio usuario en este momento.',
    });
  }
  //solo el body
  if (name)     user.Name    = name.trim();
  if (surname)  user.Surname = surname.trim();
  if (username) user.Username = username.trim().toLowerCase();

  await user.save();

  if (phone && user.UserProfile) {
    user.UserProfile.Phone = phone.trim();
    await user.UserProfile.save();
  }

  return res.status(200).json({
    success: true,
    message: 'Usuario actualizado exitosamente.',
    data: buildUserResponse(user),
  });
});
