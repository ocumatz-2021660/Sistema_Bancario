import { Role } from '../src/auth/role.model.js';
import { ALLOWED_ROLES } from './role-constants.js';

export const seedRoles = async () => {
  for (const name of ALLOWED_ROLES) {
    await Role.findOrCreate({
      where: { Name: name },
      defaults: { Name: name },
    });
  }
};
