import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export class Admin {
  static async findByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM admins WHERE email = $1 AND status = $2',
        [email, 'active']
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Admin findByEmail error:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await query(
        'SELECT id, name, email, status, is_super_admin, created_at FROM admins WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Admin findById error:', error);
      throw error;
    }
  }

  static async create(adminData) {
    try {
      const { name, email, password, status, isSuperAdmin } = adminData;
      const result = await query(
        'INSERT INTO admins (name, email, password, status, is_super_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [name, email, password, status, isSuperAdmin]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Admin create error:', error);
      throw error;
    }
  }

  static async update(id, adminData) {
    try {
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      Object.entries(adminData).forEach(([key, value]) => {
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
        `UPDATE admins SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
        updateValues
      );
      return true;
    } catch (error) {
      logger.error('Admin update error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await query('DELETE FROM admins WHERE id = $1', [id]);
      return true;
    } catch (error) {
      logger.error('Admin delete error:', error);
      throw error;
    }
  }

  static async updateLoginInfo(id, ip) {
    try {
      await query(
        'UPDATE admins SET login_attempts = 0, last_login_at = NOW(), last_login_ip = $1 WHERE id = $2',
        [ip, id]
      );
    } catch (error) {
      logger.error('Admin updateLoginInfo error:', error);
      throw error;
    }
  }

  static async getRoles(adminId) {
    try {
      const result = await query(`
        SELECT r.id, r.name, r.slug 
        FROM roles r
        JOIN role_admin ra ON r.id = ra.role_id
        WHERE ra.admin_id = $1
      `, [adminId]);
      return result.rows;
    } catch (error) {
      logger.error('Admin getRoles error:', error);
      throw error;
    }
  }

  static async getPermissions(adminId) {
    try {
      const result = await query(`
        SELECT DISTINCT p.id, p.name, p.module, p.action 
        FROM permissions p
        WHERE p.id IN (
          SELECT pa.permission_id 
          FROM permission_admin pa 
          WHERE pa.admin_id = $1
          UNION
          SELECT pr.permission_id 
          FROM permission_role pr
          JOIN role_admin ra ON pr.role_id = ra.role_id
          WHERE ra.admin_id = $1
        )
      `, [adminId]);
      return result.rows;
    } catch (error) {
      logger.error('Admin getPermissions error:', error);
      throw error;
    }
  }
}