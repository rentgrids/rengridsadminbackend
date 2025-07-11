import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const PropertyFeature = sequelize.define('PropertyFeature', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  property_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  feature_key: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  feature_value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Legacy compatibility
  name: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.feature_key;
    },
    set(value) {
      this.setDataValue('feature_key', value);
    },
  },
}, {
  tableName: 'property_features',
  indexes: [
    { fields: ['property_id'] },
    { fields: ['feature_key'] },
  ],
});

export default PropertyFeature;