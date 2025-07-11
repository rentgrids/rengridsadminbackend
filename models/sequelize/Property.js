import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  unique_id: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    defaultValue: () => `PROP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255],
    },
  },
  description: {
    type: DataTypes.TEXT,
  },
  owner_id: {
    type: DataTypes.BIGINT,
  },
  category_id: {
    type: DataTypes.BIGINT,
  },
  property_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['apartment', 'villa', 'house', 'plot', 'office', 'shop', 'warehouse', 'co-living']],
    },
  },
  listing_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['rent', 'sale', 'lease']],
    },
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    validate: {
      min: 0,
    },
  },
  monthly_rent: {
    type: DataTypes.DECIMAL(12, 2),
    validate: {
      min: 0,
    },
  },
  security_deposit: {
    type: DataTypes.DECIMAL(12, 2),
    validate: {
      min: 0,
    },
  },
  area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  area_unit: {
    type: DataTypes.STRING(20),
    defaultValue: 'sqft',
    validate: {
      isIn: [['sqft', 'sqm', 'acre', 'bigha']],
    },
  },
  bedroom: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  bathroom: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  balcony: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  bhk: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  floor_no: {
    type: DataTypes.INTEGER,
  },
  total_floors: {
    type: DataTypes.INTEGER,
  },
  furnish_type: {
    type: DataTypes.STRING(30),
    defaultValue: 'unfurnished',
    validate: {
      isIn: [['furnished', 'unfurnished', 'semi-furnished']],
    },
  },
  available_from: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  available_for: {
    type: DataTypes.JSONB,
    defaultValue: ['Family'],
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('available_for must be an array');
        }
      },
    },
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'draft',
    validate: {
      isIn: [['draft', 'published', 'blocked', 'sold', 'rented', 'pending_verification', 'verified', 'rejected']],
    },
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verified_by: {
    type: DataTypes.BIGINT,
  },
  verified_at: {
    type: DataTypes.DATE,
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 6),
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 6),
  },
  map_location: {
    type: DataTypes.TEXT,
  },
  meta_title: {
    type: DataTypes.STRING(255),
  },
  meta_description: {
    type: DataTypes.TEXT,
  },
  meta_keywords: {
    type: DataTypes.TEXT,
  },
  canonical_url: {
    type: DataTypes.TEXT,
  },
  schema_markup: {
    type: DataTypes.JSONB,
  },
  // Legacy compatibility fields
  slug: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.unique_id;
    },
  },
  city: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.location?.city;
    },
  },
  locality: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.location?.locality;
    },
  },
  address: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.location?.full_address;
    },
  },
  area_sqft: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.area;
    },
  },
  bedrooms: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.bedroom;
    },
  },
  bathrooms: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.bathroom;
    },
  },
  balconies: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.balcony;
    },
  },
  purpose: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.listing_type;
    },
  },
  furnishing: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.furnish_type;
    },
  },
  verification_status: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.is_verified ? 'verified' : 'pending';
    },
  },
  is_vacant: {
    type: DataTypes.VIRTUAL,
    get() {
      return !['sold', 'rented'].includes(this.status);
    },
  },
  is_deleted: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.status === 'blocked';
    },
  },
  map_latitude: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.latitude;
    },
  },
  map_longitude: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.longitude;
    },
  },
  map_address: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.map_location;
    },
  },
}, {
  tableName: 'properties',
  indexes: [
    { fields: ['unique_id'] },
    { fields: ['owner_id'] },
    { fields: ['category_id'] },
    { fields: ['property_type'] },
    { fields: ['listing_type'] },
    { fields: ['status'] },
    { fields: ['is_featured'] },
    { fields: ['is_verified'] },
    { fields: ['available_from'] },
    { fields: ['latitude', 'longitude'] },
  ],
});

export default Property;