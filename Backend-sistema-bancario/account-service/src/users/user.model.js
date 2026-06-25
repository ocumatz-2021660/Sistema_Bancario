import { DataTypes } from 'sequelize';
import sequelize from '../../configs/dbPostgres.js';
import { generateUserId } from '../../helpers/uuid-generator.js';
import { ACCOUNT_STATUS, ACCOUNT_STATUS_VALUES } from '../../helpers/account-status-constants.js';

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
    },
    Surname: {
      type: DataTypes.STRING(25),
      allowNull: false,
      field: 'surname',
    },
    Username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'username',
    },
    Email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      field: 'email',
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password',
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
      defaultValue: ACCOUNT_STATUS.INACTIVE,
      field: 'account_status',
    },
    IsProtected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_protected',
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
    },
  },
  {
    tableName: 'user_profiles',
    timestamps: false,
  }
);

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

User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'UserProfile' });
UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasOne(UserEmail, { foreignKey: 'user_id', as: 'UserEmail' });
UserEmail.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
