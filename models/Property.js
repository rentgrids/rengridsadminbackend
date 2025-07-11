import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export class Property {
  static async findById(id) {
    try {
      const result = await query(
        'SELECT * FROM properties WHERE id = $1 AND is_deleted = FALSE',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Property findById error:', error);
      throw error;
    }
  }

  static async create(propertyData) {
    try {
      const {
        title, slug, price, city, locality, address, area_sqft, bedrooms, bathrooms, balconies,
        bhk, property_type, purpose, furnishing, available_for, status, is_featured, owner_id,
        description, meta_title, meta_description, meta_keywords, canonical_url, featured_image,
        floor_plan, map_latitude, map_longitude, map_address
      } = propertyData;

      const result = await query(
        `INSERT INTO properties (
          title, slug, price, city, locality, address, area_sqft, bedrooms, bathrooms, balconies,
          bhk, property_type, purpose, furnishing, available_for, status, is_featured, owner_id,
          description, meta_title, meta_description, meta_keywords, canonical_url, featured_image,
          floor_plan, map_latitude, map_longitude, map_address
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
        ) RETURNING id`,
        [
          title, slug, price, city, locality, address, area_sqft, bedrooms, bathrooms, balconies,
          bhk, property_type, purpose, furnishing, available_for, status, is_featured, owner_id,
          description, meta_title, meta_description, meta_keywords, canonical_url, featured_image,
          floor_plan, map_latitude, map_longitude, map_address
        ]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Property create error:', error);
      throw error;
    }
  }

  static async update(id, propertyData) {
    try {
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      Object.entries(propertyData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = $${paramIndex}`);
          updateValues.push(value);
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        return false;
      }

      updateFields.push(`updated_at = NOW()`);
      updateValues.push(id);

      await query(
        `UPDATE properties SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
        updateValues
      );
      return true;
    } catch (error) {
      logger.error('Property update error:', error);
      throw error;
    }
  }

  static async softDelete(id) {
    try {
      await query(
        'UPDATE properties SET is_deleted = TRUE, updated_at = NOW() WHERE id = $1',
        [id]
      );
      return true;
    } catch (error) {
      logger.error('Property softDelete error:', error);
      throw error;
    }
  }

  static async getAll(filters = {}) {
    try {
      let whereClause = 'WHERE is_deleted = FALSE';
      let queryParams = [];
      let paramIndex = 1;

      if (filters.search) {
        whereClause += ` AND (title ILIKE $${paramIndex} OR locality ILIKE $${paramIndex} OR address ILIKE $${paramIndex})`;
        queryParams.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters.status) {
        whereClause += ` AND status = $${paramIndex}`;
        queryParams.push(filters.status);
        paramIndex++;
      }

      if (filters.city) {
        whereClause += ` AND city ILIKE $${paramIndex}`;
        queryParams.push(`%${filters.city}%`);
        paramIndex++;
      }

      if (filters.type) {
        whereClause += ` AND property_type = $${paramIndex}`;
        queryParams.push(filters.type);
        paramIndex++;
      }

      if (filters.purpose) {
        whereClause += ` AND purpose = $${paramIndex}`;
        queryParams.push(filters.purpose);
        paramIndex++;
      }

      if (filters.is_featured !== undefined) {
        whereClause += ` AND is_featured = $${paramIndex}`;
        queryParams.push(filters.is_featured);
        paramIndex++;
      }

      const countResult = await query(
        `SELECT COUNT(*) FROM properties ${whereClause}`,
        queryParams
      );

      const propertiesResult = await query(
        `SELECT id, title, slug, price, city, locality, property_type, purpose,
                status, is_featured, featured_image, views, created_at, updated_at
         FROM properties
         ${whereClause}
         ORDER BY is_featured DESC, created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...queryParams, filters.limit || 10, filters.offset || 0]
      );

      return {
        properties: propertiesResult.rows,
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      logger.error('Property getAll error:', error);
      throw error;
    }
  }

  static async getImages(propertyId) {
    try {
      const result = await query(
        `SELECT id, image_url, is_gallery, is_floor_plan, sort_order
         FROM property_images
         WHERE property_id = $1
         ORDER BY sort_order, id`,
        [propertyId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Property getImages error:', error);
      throw error;
    }
  }

  static async getFeatures(propertyId) {
    try {
      const result = await query(
        `SELECT id, name FROM property_features WHERE property_id = $1`,
        [propertyId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Property getFeatures error:', error);
      throw error;
    }
  }

  static async getAmenities(propertyId) {
    try {
      const result = await query(
        `SELECT a.id, a.name, a.icon
         FROM amenities a
         JOIN property_amenities pa ON a.id = pa.amenity_id
         WHERE pa.property_id = $1`,
        [propertyId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Property getAmenities error:', error);
      throw error;
    }
  }
}