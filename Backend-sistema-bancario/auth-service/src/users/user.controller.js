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
import { UserRole } from '../auth/role.model.js';
import mongoose from 'mongoose';

export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { roleName } = req.body || {};

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
  
  if (user.IsProtected) {
    return res.status(403).json({
      success: false,
      message: 'Este usuario está protegido y no puede ser modificado.',
    });
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado.',
    });
  }

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
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
    accountStatus,
  });

  return res.status(200).json({
    success: true,
    message: 'Usuarios obtenidos exitosamente.',
    data: users.map(buildUserResponse),
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      limit: parseInt(limit),
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
  if (name) user.Name = name.trim();
  if (surname) user.Surname = surname.trim();
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

export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado.',
    });
  }

  if (user.IsProtected) {
    return res.status(403).json({
      success: false,
      message: 'Este usuario está protegido y no puede ser eliminado.',
    });
  }

  if (userId === req.userId) {
    return res.status(400).json({
      success: false,
      message: 'No puedes eliminar tu propio usuario.',
    });
  }

  try {
    const db = mongoose.connection.db;
    const ObjectId = mongoose.Types.ObjectId;

    const cuentas = await db.collection('cuentas').find({ usuario_cuenta: userId }).toArray();
    const cuentaIds = cuentas.map(c => c._id);

    await db.collection('favoritos').deleteMany({ dueno_favorito: userId });

    if (cuentaIds.length > 0) {
      await db.collection('solicitudes').deleteMany({
        cuenta: { $in: cuentaIds.map(id => new ObjectId(id)) }
      });
    }

    await db.collection('cuentas').deleteMany({ usuario_cuenta: userId });
  } catch (mongoError) {
    console.error('Error eliminando datos en MongoDB:', mongoError);
  }

  const transaction = await sequelize.transaction();
  try {
    if (user.UserPasswordReset) {
      await user.UserPasswordReset.destroy({ transaction });
    }
    if (user.UserEmail) {
      await user.UserEmail.destroy({ transaction });
    }
    if (user.UserProfile) {
      await user.UserProfile.destroy({ transaction });
    }

    await UserRole.destroy({ where: { UserId: userId }, transaction });
    await user.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Usuario y todos sus datos asociados eliminados exitosamente.',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error eliminando usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el usuario.',
      error: error.message,
    });
  }
});
