import { User, UserProfile } from '../src/users/user.model.js';
import { findUserById } from './user-db.js';
import { buildUserResponse } from '../utils/user-helpers.js';
import { deleteImage } from './cloudinary-service.js';

export const updateProfileHelper = async (userId, updateData) => {
  const transaction = await User.sequelize.transaction();

  try {
    const { name, surname, phone, profilePicture, username } = updateData;

    const user = await findUserById(userId);
    if (!user) {
      const err = new Error('Usuario no encontrado');
      err.status = 404;
      throw err;
    }

    // Validar username si se quiere cambiar
    if (username && username.trim() !== user.Username) {
      const existing = await User.findOne({
        where: { Username: username.trim() },
      });
      if (existing) {
        const err = new Error('Ese nombre de usuario ya está en uso');
        err.status = 409;
        throw err;
      }
    }

    const userUpdates = {};
    if (name)     userUpdates.Name     = name.trim();
    if (surname)  userUpdates.Surname  = surname.trim();
    if (username) userUpdates.Username = username.trim();

    if (Object.keys(userUpdates).length > 0) {
      await User.update(userUpdates, {
        where: { Id: userId },
        transaction,
      });
    }

    const profileUpdates = {};
    if (phone) profileUpdates.Phone = phone;

    if (profilePicture) {
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
