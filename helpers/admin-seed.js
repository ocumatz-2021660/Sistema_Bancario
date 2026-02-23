import { User, UserProfile, UserEmail, UserPasswordReset } from '../src/users/user.model.js';
import { Role, UserRole } from '../src/auth/role.model.js';
import { ADMIN_ROLE } from './role-constants.js';
import { hashPassword } from '../utils/password-utils.js';
import { generateUserId } from './uuid-generator.js';


 /* Crea un usuario ADMIN por defecto si no existe ningún administrador.*/
export const seedAdminUser = async () => {
  try {
    const adminRole = await Role.findOne({ where: { Name: ADMIN_ROLE } });
    if (!adminRole) {
      console.warn('Admin seed | ADMIN_ROLE not found. Skipping admin user creation.');
      return;
    }

    // Verificar si ya existe al menos un usuario con rol ADMIN
    const existingAdmin = await UserRole.findOne({
      where: { RoleId: adminRole.Id },
    });

    if (existingAdmin) {
      console.log('Admin seed | Admin user already exists. continue.');
      return;
    }

    const adminEmail    = process.env.ADMIN_DEFAULT_EMAIL    || `${process.env.EMAIL_FROM}`;
    const adminUsername = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin1234!';
    const adminName     = process.env.ADMIN_DEFAULT_NAME     || 'Administrador';
    const adminSurname  = process.env.ADMIN_DEFAULT_SURNAME  || 'ElAdministrador';
    const adminPhone    = process.env.ADMIN_DEFAULT_PHONE    || '00000000';

    // Verificar que no exista un usuario con ese email/username
    const exists = await User.findOne({
      where: { Email: adminEmail.toLowerCase() },
    });
    if (exists) {
      console.log('Admin seed | User with admin email already exists. Skipping.');
      return;
    }

    const hashedPassword = await hashPassword(adminPassword);
    const transaction = await User.sequelize.transaction();

    try {
      const adminUser = await User.create(
        {
          Name:     adminName,
          Surname:  adminSurname,
          Username: adminUsername.toLowerCase(),
          Email:    adminEmail.toLowerCase(),
          Password: hashedPassword,
          Status:   true, //  (sin requerir verificación)
        },
        { transaction }
      );

      await UserProfile.create(
        {
          UserId:         adminUser.Id,
          Phone:          adminPhone,
          ProfilePicture: '',
        },
        { transaction }
      );

      await UserEmail.create(
        {
          UserId:        adminUser.Id,
          EmailVerified: true, // El admin ya está verificado por defecto
        },
        { transaction }
      );

      await UserPasswordReset.create(
        { UserId: adminUser.Id },
        { transaction }
      );

      await UserRole.create(
        {
          UserId: adminUser.Id,
          RoleId: adminRole.Id,
        },
        { transaction }
      );

      await transaction.commit();

      console.log(`Admin seed | ✅ Default admin user created:`);
      console.log(`Admin seed |   Email:    ${adminEmail}`);
      console.log(`Admin seed |   Username: ${adminUsername}`);
      console.log(`Admin seed |   Password: ${adminPassword}`);
      console.log('Admin seed | ⚠️  Change these credentials in production!');
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Admin seed | Error creating default admin user:', error.message);
  }
};
