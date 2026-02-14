import { Role, UserRole } from '../src/auth/role.model.js';
import { User, UserEmail, UserProfile } from '../src/users/user.model.js';
import { ALLOWED_ROLES } from './role-constants.js';

export const getRoleByName = async (roleName) => {
  return Role.findOne({ where: { Name: roleName } });
};

export const countUsersInRole = async (roleName) => {
  const count = await UserRole.count({
    include: [{ model: Role, as: 'Role', where: { Name: roleName } }],
    distinct: true,
    col: 'user_id',
  });
  return count;
};

export const getUserRoleNames = async (userId) => {
  const userRoles = await UserRole.findAll({
    where: { UserId: userId },
    include: [{ model: Role, as: 'Role' }],
  });
  return userRoles.map((ur) => ur.Role?.Name).filter(Boolean);
};

export const getUsersByRole = async (roleName) => {
  const users = await User.findAll({
    include: [
      { model: UserProfile, as: 'UserProfile' },
      { model: UserEmail, as: 'UserEmail' },
      {
        model: UserRole,
        as: 'UserRoles',
        include: [{ model: Role, as: 'Role', where: { Name: roleName } }],
      },
    ],
  });
  return users;
};

export const setUserSingleRole = async (user, roleName, sequelize) => {
  // Normalize
  const normalized = (roleName || '').trim().toUpperCase();
  if (!ALLOWED_ROLES.includes(normalized)) {
    const err = new Error('Role not allowed. Use ADMIN_ROLE or USER_ROLE');
    err.status = 400;
    throw err;
  }

  return sequelize.transaction(async (t) => {
    // If demoting an admin, ensure not the last one
    const isUserAdmin = (user.UserRoles || []).some(
      (r) => r.Role?.Name === 'ADMIN_ROLE'
    );
    if (isUserAdmin && normalized !== 'ADMIN_ROLE') {
      const adminCount = await countUsersInRole('ADMIN_ROLE');
      if (adminCount <= 1) {
        const err = new Error('Cannot remove the last administrator');
        err.status = 409;
        throw err;
      }
    }

    // Ensure role exists
    const role = await getRoleByName(normalized);
    if (!role) {
      const err = new Error(`Role ${normalized} not found`);
      err.status = 404;
      throw err;
    }

    // Remove existing roles for user
    await UserRole.destroy({ where: { UserId: user.Id }, transaction: t });

    // Assign new role
    await UserRole.create(
      {
        UserId: user.Id,
        RoleId: role.Id,
      },
      { transaction: t }
    );

    // Reload user with roles
    const updated = await User.findByPk(user.Id, {
      include: [
        { model: UserProfile, as: 'UserProfile' },
        { model: UserEmail, as: 'UserEmail' },
        {
          model: UserRole,
          as: 'UserRoles',
          include: [{ model: Role, as: 'Role' }],
        },
      ],
      transaction: t,
    });

    return { updatedUser: updated, roleName: normalized };
  });
};
