import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const PropertyLocation = sequelize.define('PropertyLocation', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  property_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'India',
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  locality: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  landmark: {
    type: DataTypes.STRING(255),
  },
  zipcode: {
    type: DataTypes.STRING(20),
  },
  full_address: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'property_location',
  indexes: [
    { fields: ['property_id'] },
    { fields: ['city'] },
    { fields: ['locality'] },
  ],
});

export default PropertyLocation;