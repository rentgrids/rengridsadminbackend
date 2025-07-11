import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive', 'banned']],
    },
  },
  is_blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  email_verified_at: {
    type: DataTypes.DATE,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  last_login_at: {
    type: DataTypes.DATE,
  },
  last_login_ip: {
    type: DataTypes.INET,
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  provider: {
    type: DataTypes.STRING(50),
  },
  provider_id: {
    type: DataTypes.STRING(100),
  },
  user_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'tenant', 'landlord', 'owner', 'premium']],
    },
  },
  profile_image: {
    type: DataTypes.TEXT,
  },
  address: {
    type: DataTypes.TEXT,
  },
  dob: {
    type: DataTypes.DATE,
  },
  gender: {
    type: DataTypes.STRING(10),
    validate: {
      isIn: [['male', 'female', 'other']],
    },
  },
}, {
  tableName: 'users',
  indexes: [
    { fields: ['email'] },
    { fields: ['status'] },
    { fields: ['is_deleted'] },
    { fields: ['user_type'] },
  ],
});

export default User;