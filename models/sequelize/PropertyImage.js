import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const PropertyImage = sequelize.define('PropertyImage', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  property_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  image_type: {
    type: DataTypes.STRING(20),
    defaultValue: 'gallery',
    validate: {
      isIn: [['gallery', 'floor_plan', 'featured']],
    },
  },
  video: {
    type: DataTypes.TEXT,
  },
  image_path: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  alt_text: {
    type: DataTypes.STRING(255),
  },
  uploaded_by: {
    type: DataTypes.BIGINT,
  },
  // Legacy fields for backward compatibility
  image_url: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.image_path;
    },
    set(value) {
      this.setDataValue('image_path', value);
    },
  },
  is_gallery: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.image_type === 'gallery';
    },
  },
  is_floor_plan: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.image_type === 'floor_plan';
    },
  },
  is_featured: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.image_type === 'featured' || this.is_primary;
    },
  },
}, {
  tableName: 'property_images',
  indexes: [
    { fields: ['property_id'] },
    { fields: ['image_type'] },
    { fields: ['is_primary'] },
  ],
});

export default PropertyImage;