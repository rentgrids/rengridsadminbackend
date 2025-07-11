import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export class User {
  static async findById(id) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE id = $1 AND is_deleted = FALSE',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('User findById error:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1 AND is_deleted = FALSE',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('User findByEmail error:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { name, email, phone, password, status, user_type, address, dob, gender } = userData;
      const result = await query(
        `INSERT INTO users (name, email, phone, password, status, user_type, address, dob, gender) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING id`,
        [name, email, phone, password, status, user_type, address, dob, gender]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('User create error:', error);
      throw error;
    }
  }

  static async update(id, userData) {
    try {
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      Object.entries(userData).forEach(([key, value]) => {
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
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
        updateValues
      );
      return true;
    } catch (error) {
      logger.error('User update error:', error);
      throw error;
    }
  }

  static async softDelete(id) {
    try {
      await query(
        'UPDATE users SET is_deleted = TRUE, updated_at = NOW() WHERE id = $1',
        [id]
      );
      return true;
    } catch (error) {
      logger.error('User softDelete error:', error);
      throw error;
    }
  }

  static async getAll(filters = {}) {
    try {
      let whereClause = 'WHERE is_deleted = FALSE';
      let queryParams = [];
      let paramIndex = 1;

      if (filters.search) {
        whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
        queryParams.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters.status) {
        whereClause += ` AND status = $${paramIndex}`;
        queryParams.push(filters.status);
        paramIndex++;
      }

      if (filters.user_type) {
        whereClause += ` AND user_type = $${paramIndex}`;
        queryParams.push(filters.user_type);
        paramIndex++;
      }

      if (filters.is_blocked !== undefined) {
        whereClause += ` AND is_blocked = $${paramIndex}`;
        queryParams.push(filters.is_blocked);
        paramIndex++;
      }

      const countResult = await query(
        `SELECT COUNT(*) FROM users ${whereClause}`,
        queryParams
      );

      const usersResult = await query(
        `SELECT id, name, email, phone, status, user_type, is_blocked, is_verified, 
                last_login_at, created_at, updated_at
         FROM users 
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...queryParams, filters.limit || 10, filters.offset || 0]
      );

      return {
        users: usersResult.rows,
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      logger.error('User getAll error:', error);
      throw error;
    }
  }
}