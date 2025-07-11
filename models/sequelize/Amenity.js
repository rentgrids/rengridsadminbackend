import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Amenity = sequelize.define('Amenity', {
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
  category: {
    type: DataTypes.STRING(50),
    defaultValue: 'general',
    validate: {
      isIn: [['general', 'security', 'recreation', 'convenience', 'connectivity']],
    },
  },
  icon: {
    type: DataTypes.STRING(100),
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'amenities',
  indexes: [
    { fields: ['category'] },
    { fields: ['is_active'] },
  ],
});

export default Amenity;