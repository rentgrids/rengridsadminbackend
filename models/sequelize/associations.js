import Property from './Property.js';
import PropertyCategory from './PropertyCategory.js';
import PropertyDocument from './PropertyDocument.js';
import PropertyImage from './PropertyImage.js';
import PropertyLocation from './PropertyLocation.js';
import PropertyFeature from './PropertyFeature.js';
import Amenity from './Amenity.js';
import User from './User.js';

// Property associations
Property.belongsTo(PropertyCategory, {
  foreignKey: 'category_id',
  as: 'category',
});

Property.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner',
});

Property.belongsTo(User, {
  foreignKey: 'verified_by',
  as: 'verifier',
});

Property.hasMany(PropertyDocument, {
  foreignKey: 'property_id',
  as: 'documents',
});

Property.hasMany(PropertyImage, {
  foreignKey: 'property_id',
  as: 'images',
});

Property.hasOne(PropertyLocation, {
  foreignKey: 'property_id',
  as: 'location',
});

Property.hasMany(PropertyFeature, {
  foreignKey: 'property_id',
  as: 'features',
});

Property.belongsToMany(Amenity, {
  through: 'property_amenities',
  foreignKey: 'property_id',
  otherKey: 'amenity_id',
  as: 'amenities',
});

// PropertyCategory associations
PropertyCategory.hasMany(Property, {
  foreignKey: 'category_id',
  as: 'properties',
});

// PropertyDocument associations
PropertyDocument.belongsTo(Property, {
  foreignKey: 'property_id',
  as: 'property',
});

PropertyDocument.belongsTo(User, {
  foreignKey: 'uploaded_by',
  as: 'uploader',
});

// PropertyImage associations
PropertyImage.belongsTo(Property, {
  foreignKey: 'property_id',
  as: 'property',
});

PropertyImage.belongsTo(User, {
  foreignKey: 'uploaded_by',
  as: 'uploader',
});

// PropertyLocation associations
PropertyLocation.belongsTo(Property, {
  foreignKey: 'property_id',
  as: 'property',
});

// PropertyFeature associations
PropertyFeature.belongsTo(Property, {
  foreignKey: 'property_id',
  as: 'property',
});

// Amenity associations
Amenity.belongsToMany(Property, {
  through: 'property_amenities',
  foreignKey: 'amenity_id',
  otherKey: 'property_id',
  as: 'properties',
});

// User associations
User.hasMany(Property, {
  foreignKey: 'owner_id',
  as: 'properties',
});

User.hasMany(PropertyDocument, {
  foreignKey: 'uploaded_by',
  as: 'uploaded_documents',
});

User.hasMany(PropertyImage, {
  foreignKey: 'uploaded_by',
  as: 'uploaded_images',
});

export {
  Property,
  PropertyCategory,
  PropertyDocument,
  PropertyImage,
  PropertyLocation,
  PropertyFeature,
  Amenity,
  User,
};