import { User } from '../models/User.js';
import { hashPassword } from '../utils/helpers.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export class UserService {
  static async createUser(userData) {
    try {
      const { name, email, phone, password, status, user_type, address, dob, gender } = userData;

      // Check if email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        status,
        user_type,
        address,
        dob,
        gender
      });

      logger.info(`User created successfully: ${email}`);
      return { userId: user.id };
    } catch (error) {
      logger.error('UserService createUser error:', error);
      throw error;
    }
  }

  static async getAllUsers(filters = {}) {
    try {
      const { page = 1, limit = 10, search = '', status, user_type, is_blocked } = filters;
      const offset = (page - 1) * limit;

      const filterOptions = {
        search,
        status,
        user_type,
        is_blocked: is_blocked === 'true' ? true : is_blocked === 'false' ? false : undefined,
        limit,
        offset
      };

      const result = await User.getAll(filterOptions);

      return {
        data: result.users,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit)
        }
      };
    } catch (error) {
      logger.error('UserService getAllUsers error:', error);
      throw error;
    }
  }

  static async getUserById(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove password from response
      delete user.password;
      return user;
    } catch (error) {
      logger.error('UserService getUserById error:', error);
      throw error;
    }
  }

  static async updateUser(id, userData) {
    try {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      const success = await User.update(id, userData);
      if (!success) {
        throw new Error('No fields to update');
      }

      logger.info(`User updated successfully: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('UserService updateUser error:', error);
      throw error;
    }
  }

  static async updateUserStatus(id, status) {
    try {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      await User.update(id, { status });
      logger.info(`User status updated to ${status}: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('UserService updateUserStatus error:', error);
      throw error;
    }
  }

  static async updateUserBlockStatus(id, is_blocked) {
    try {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      await User.update(id, { is_blocked });
      const message = is_blocked ? 'User blocked successfully' : 'User unblocked successfully';
      logger.info(`${message}: ${id}`);
      return { success: true, message };
    } catch (error) {
      logger.error('UserService updateUserBlockStatus error:', error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      await User.softDelete(id);
      logger.info(`User deleted successfully: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('UserService deleteUser error:', error);
      throw error;
    }
  }

  static async bulkDeleteUsers(userIds) {
    try {
      const placeholders = userIds.map((_, index) => `$${index + 1}`).join(',');
      
      const result = await query(
        `UPDATE users 
         SET is_deleted = TRUE, updated_at = NOW() 
         WHERE id IN (${placeholders}) AND is_deleted = FALSE`,
        userIds
      );

      logger.info(`Bulk deleted ${result.rowCount} users`);
      return { 
        deletedCount: result.rowCount,
        requestedCount: userIds.length 
      };
    } catch (error) {
      logger.error('UserService bulkDeleteUsers error:', error);
      throw error;
    }
  }

  static async getUserLoginHistory(id, filters = {}) {
    try {
      const { page = 1, limit = 10 } = filters;
      const offset = (page - 1) * limit;

      // Check if user exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Get total count
      const countResult = await query(
        'SELECT COUNT(*) FROM user_logins WHERE user_id = $1',
        [id]
      );
      const total = parseInt(countResult.rows[0].count);

      // Get login history
      const loginsResult = await query(
        `SELECT id, login_at, ip_address, user_agent, platform, location, status
         FROM user_logins 
         WHERE user_id = $1
         ORDER BY login_at DESC
         LIMIT $2 OFFSET $3`,
        [id, limit, offset]
      );

      return {
        data: loginsResult.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('UserService getUserLoginHistory error:', error);
      throw error;
    }
  }

  static async getUserStats() {
    try {
      const stats = await query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN user_type = 'tenant' THEN 1 END) as tenant_count,
          COUNT(CASE WHEN user_type = 'landlord' THEN 1 END) as landlord_count,
          COUNT(CASE WHEN user_type = 'user' THEN 1 END) as regular_user_count,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_users,
          COUNT(CASE WHEN is_blocked = true THEN 1 END) as blocked_users,
          COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users
        FROM users 
        WHERE is_deleted = FALSE
      `);

      const monthlySignups = await query(`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as signups
        FROM users 
        WHERE is_deleted = FALSE 
          AND created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `);

      const recentSignups = await query(`
        SELECT 
          DATE(created_at) as signup_date,
          COUNT(*) as daily_signups
        FROM users 
        WHERE is_deleted = FALSE 
          AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY signup_date DESC
      `);

      return {
        overview: stats.rows[0],
        monthly_signups: monthlySignups.rows,
        recent_signups: recentSignups.rows
      };
    } catch (error) {
      logger.error('UserService getUserStats error:', error);
      throw error;
    }
  }

  static async exportUsers(filters = {}) {
    try {
      let whereClause = 'WHERE is_deleted = FALSE';
      let queryParams = [];
      let paramIndex = 1;

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

      const result = await query(
        `SELECT 
          id, name, email, phone, user_type, status, is_blocked, is_verified,
          address, dob, gender, created_at, updated_at
         FROM users 
         ${whereClause}
         ORDER BY created_at DESC`,
        queryParams
      );

      return {
        users: result.rows,
        total: result.rows.length,
        exported_at: new Date().toISOString()
      };
    } catch (error) {
      logger.error('UserService exportUsers error:', error);
      throw error;
    }
  }
}