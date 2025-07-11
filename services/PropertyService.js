import { Property } from '../models/Property.js';
import { generateSlug } from '../utils/helpers.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export class PropertyService {
  static async createProperty(propertyData) {

  }

  static async getAllProperties(filters = {}) {

  }

  static async getPropertyById(id) {

  }

  static async updateProperty(id, propertyData) {

  }

  static async updatePropertyStatus(id, status) {

  }

  static async deleteProperty(id) {

  }

  static async bulkDeleteProperties(propertyIds) {

  }

  static async uploadPropertyImages(propertyId, images) {

  }

  static async deletePropertyImage(propertyId, imageId) {

  }

  static async getAllAmenities() {
    try {
      const result = await query(
        'SELECT id, name, icon FROM amenities ORDER BY name'
      );
      return result.rows;
    } catch (error) {
      logger.error('PropertyService getAllAmenities error:', error);
      throw error;
    }
  }

  static async getPropertyStats() {

  }
}