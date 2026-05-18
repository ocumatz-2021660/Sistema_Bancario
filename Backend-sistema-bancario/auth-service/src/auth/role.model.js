import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helpers/uuid-generator.js';
import { User } from '../users/user.model.js';
import { ALLOWED_ROLES } from '../../helpers/role-constants.js';

export const Role = sequelize.define(
  'Role',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    Name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'name',
      validate: {
        notEmpty: { msg: 'El nombre del rol es obligatorio.' },
        isIn: {
          args: [ALLOWED_ROLES],
          msg: 'Rol no permitido. Use ADMIN_ROLE o USER_ROLE.',
        },
      },
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    tableName: 'roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export const UserRole = sequelize.define(
  'UserRole',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    UserId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    RoleId: {
      type: DataTypes.STRING(16),
      allowNull: false,
      field: 'role_id',
      references: {
        model: Role,
        key: 'id',
      },
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    tableName: 'user_roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Associations
User.hasMany(UserRole, { foreignKey: 'user_id', as: 'UserRoles' });
UserRole.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

Role.hasMany(UserRole, { foreignKey: 'role_id', as: 'UserRoles' });
UserRole.belongsTo(Role, { foreignKey: 'role_id', as: 'Role' });
