import { User, UserProfile } from '../src/users/user.model.js';
import { findUserById } from './user-db.js';
import { buildUserResponse } from '../utils/user-helpers.js';
import { deleteImage } from './cloudinary-service.js';

/**
 * Actualiza los datos de perfil de un usuario autenticado.
 * Permite cambiar: nombre, apellido, teléfono y foto de perfil.
 * La foto de perfil viene ya subida a Cloudinary (req.file.path).
 */
export const updateProfileHelper = async (userId, updateData) => {
  const transaction = await User.sequelize.transaction();

  try {
    const { name, surname, phone, profilePicture } = updateData;

    const user = await findUserById(userId);
    if (!user) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      throw err;
    }

    // Construir objeto solo con los campos que llegaron
    const userUpdates = {};
    if (name)    userUpdates.Name    = name.trim();
    if (surname) userUpdates.Surname = surname.trim();

    if (Object.keys(userUpdates).length > 0) {
      await User.update(userUpdates, {
        where: { Id: userId },
        transaction,
      });
    }

    // Actualizar perfil (teléfono y/o foto)
    const profileUpdates = {};
    if (phone) profileUpdates.Phone = phone;

    if (profilePicture) {
      // Si ya tenía una foto personalizada en Cloudinary, eliminarla
      const oldPicture = user.UserProfile?.ProfilePicture;
      if (oldPicture && oldPicture.includes('res.cloudinary.com')) {
        await deleteImage(oldPicture).catch((err) =>
          console.warn('No se pudo eliminar la foto anterior:', err.message)
        );
      }
      profileUpdates.ProfilePicture = profilePicture;
    }

    if (Object.keys(profileUpdates).length > 0) {
      await UserProfile.update(profileUpdates, {
        where: { UserId: userId },
        transaction,
      });
    }

    await transaction.commit();

    // Retornar usuario actualizado
    const updatedUser = await findUserById(userId);
    return {
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: buildUserResponse(updatedUser),
    };
  } catch (error) {
    await transaction.rollback();
    console.error('Error actualizando perfil:', error);
    throw error;
  }
};
