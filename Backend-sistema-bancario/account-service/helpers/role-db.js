import { Role, UserRole } from '../src/auth/role.model.js';
import { User } from '../src/users/user.model.js';
import { ALLOWED_ROLES } from './role-constants.js';

export const getUserRoleNames = async (userId) => {
  const userRoles = await UserRole.findAll({
    where: { UserId: userId },
    include: [{ model: Role, as: 'Role' }],
  });
  return userRoles.map((ur) => ur.Role?.Name).filter(Boolean);
};

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
