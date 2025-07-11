import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const PropertyCategory = sequelize.define('PropertyCategory', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  icon: {
    type: DataTypes.STRING(100),
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'property_categories',
  indexes: [
    { fields: ['slug'] },
    { fields: ['is_active'] },
  ],
});

export default PropertyCategory;