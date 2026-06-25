import { User, UserProfile, UserEmail } from '../src/users/user.model.js';
import { UserRole, Role } from '../src/auth/role.model.js';
import { Op } from 'sequelize';

export const findUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      include: [
        { model: UserProfile, as: 'UserProfile' },
        { model: UserEmail, as: 'UserEmail' },
        {
          model: UserRole,
          as: 'UserRoles',
          include: [{ model: Role, as: 'Role' }],
        },
      ],
    });
    return user;
  } catch (error) {
    console.error('Error buscando usuario por ID:', error);
    throw new Error('Error al buscar usuario');
  }
};
