import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helpers/uuid-generator.js';
import { ACCOUNT_STATUS, ACCOUNT_STATUS_VALUES } from '../../helpers/account-status-constants.js';

// Modelo User principal
export const User = sequelize.define(
  'User',
  {
    Id: {
      type: DataTypes.STRING(16),
      primaryKey: true,
      field: 'id',
      defaultValue: () => generateUserId(),
    },
    Name: {
      type: DataTypes.STRING(25),
      allowNull: false,
      field: 'name',
      validate: {
        notEmpty: { msg: 'El nombre es obligatorio.' },
        len: {
          args: [1, 25],
          msg: 'El nombre no puede tener más de 25 caracteres.',
        },
      },
    },
    Surname: {
      type: DataTypes.STRING(25),
      allowNull: false,
      field: 'surname',
      validate: {
        notEmpty: { msg: 'El apellido es obligatorio.' },
        len: {
          args: [1, 25],
          msg: 'El apellido no puede tener más de 25 caracteres.',
        },
      },
    },
    Username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'username',
      validate: {
        notEmpty: { msg: 'El nombre de usuario es obligatorio.' },
        len: {
          args: [1, 50],
          msg: 'El nombre de usuario no puede tener más de 50 caracteres.',
        },
      },
    },
    Email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      field: 'email',
      validate: {
        notEmpty: { msg: 'El correo electrónico es obligatorio.' },
        isEmail: { msg: 'El correo electrónico no tiene un formato válido.' },
        len: {
          args: [1, 150],
          msg: 'El correo electrónico no puede tener más de 150 caracteres.',
        },
      },
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password',
      validate: {
        notEmpty: { msg: 'La contraseña es obligatoria.' },
        len: {
          args: [8, 255],
          msg: 'La contraseña debe tener entre 8 y 255 caracteres.',
        },
      },
    },
    Status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'status',
    },
    
    AccountStatus: {
      type: DataTypes.ENUM(...ACCOUNT_STATUS_VALUES),
      allowNull: false,
      defaultValue: ACCOUNT_STATUS.INACTIVE, // Por defecto: inactivo hasta verificar email
      field: 'account_status',
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Modelo UserProfile
export const UserProfile = sequelize.define(
  'UserProfile',
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
      references: { model: User, key: 'id' },
    },
    ProfilePicture: {
      type: DataTypes.STRING(512),
      defaultValue: '',
      field: 'profile_picture',
    },
    Phone: {
      type: DataTypes.STRING(8),
      allowNull: false,
      field: 'phone',
      validate: {
        notEmpty: { msg: 'El número de teléfono es obligatorio.' },
        len: { args: [8, 8], msg: 'El número de teléfono debe tener exactamente 8 dígitos.' },
        isNumeric: { msg: 'El teléfono solo debe contener números.' },
      },
    },
  },
  {
    tableName: 'user_profiles',
    timestamps: false,
  }
);

// Modelo UserEmail
export const UserEmail = sequelize.define(
  'UserEmail',
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
      references: { model: User, key: 'id' },
    },
    EmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'email_verified',
    },
    EmailVerificationToken: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'email_verification_token',
    },
    EmailVerificationTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'email_verification_token_expiry',
    },
  },
  {
    tableName: 'user_emails',
    timestamps: false,
  }
);

// Modelo UserPasswordReset
export const UserPasswordReset = sequelize.define(
  'UserPasswordReset',
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
      references: { model: User, key: 'id' },
    },
    PasswordResetToken: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'password_reset_token',
    },
    PasswordResetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'password_reset_token_expiry',
    },
  },
  {
    tableName: 'user_password_resets',
    timestamps: false,
  }
);

// Relaciones
User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'UserProfile' });
UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasOne(UserEmail, { foreignKey: 'user_id', as: 'UserEmail' });
UserEmail.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasOne(UserPasswordReset, { foreignKey: 'user_id', as: 'UserPasswordReset' });
UserPasswordReset.belongsTo(User, { foreignKey: 'user_id', as: 'User' });