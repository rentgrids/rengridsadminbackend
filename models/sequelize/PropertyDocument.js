import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const PropertyDocument = sequelize.define('PropertyDocument', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  property_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  doc_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['ownership_deed', 'tax_receipt', 'noc', 'floor_plan', 'legal_clearance', 'rental_agreement', 'other']],
    },
  },
  doc_path: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  document_name: {
    type: DataTypes.STRING(255),
  },
  file_size: {
    type: DataTypes.INTEGER,
  },
  mime_type: {
    type: DataTypes.STRING(100),
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  uploaded_by: {
    type: DataTypes.BIGINT,
  },
  // Legacy fields for backward compatibility
  document_url: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.doc_path;
    },
    set(value) {
      this.setDataValue('doc_path', value);
    },
  },
  document_type: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.doc_type;
    },
    set(value) {
      this.setDataValue('doc_type', value);
    },
  },
}, {
  tableName: 'property_documents',
  indexes: [
    { fields: ['property_id'] },
    { fields: ['doc_type'] },
    { fields: ['is_verified'] },
  ],
});

export default PropertyDocument;