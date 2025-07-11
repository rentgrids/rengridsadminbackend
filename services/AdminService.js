import { Admin } from '../models/Admin.js';
import { hashPassword, generateSlug, groupPermissionsByModule } from '../utils/helpers.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export class AdminService {
  static async createAdmin(adminData) {
    try {
      const { name, email, password, status, isSuperAdmin, roleIds, permissionIds } = adminData;

      // Check if email already exists
      const existingAdmin = await Admin.findByEmail(email);
      if (existingAdmin) {
        throw new Error('Email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create admin
      const admin = await Admin.create({
        name,
        email,
        password: hashedPassword,
        status,
        isSuperAdmin
      });

      const adminId = admin.id;

      // Assign roles
      if (roleIds && roleIds.length > 0) {
        const roleQueries = roleIds.map(roleId =>
          query('INSERT INTO role_admin (admin_id, role_id) VALUES ($1, $2)', [adminId, roleId])
        );
        await Promise.all(roleQueries);
      }

      // Assign permissions
      if (permissionIds && permissionIds.length > 0) {
        const permissionQueries = permissionIds.map(permissionId =>
          query('INSERT INTO permission_admin (admin_id, permission_id) VALUES ($1, $2)', [adminId, permissionId])
        );
        await Promise.all(permissionQueries);
      }

      logger.info(`Admin created successfully: ${email}`);
      return { adminId };
    } catch (error) {
      logger.error('AdminService createAdmin error:', error);
      throw error;
    }
  }

  static async getAllAdmins(filters = {}) {
    try {
      const { page = 1, limit = 10, search = '' } = filters;
      const offset = (page - 1) * limit;

      let whereClause = '';
      let queryParams = [];

      if (search) {
        whereClause = 'WHERE (a.name ILIKE $1 OR a.email ILIKE $1)';
        queryParams = [`%${search}%`];
      }

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) FROM admins a ${whereClause}`,
        queryParams
      );
      const total = parseInt(countResult.rows[0].count);

      // Get admins with roles
      const adminsResult = await query(
        `SELECT a.id, a.name, a.email, a.status, a.is_super_admin, a.created_at,
                COALESCE(
                  json_agg(
                    DISTINCT jsonb_build_object(
                      'id', r.id,
                      'name', r.name,
                      'slug', r.slug
                    )
                  ) FILTER (WHERE r.id IS NOT NULL),
                  '[]'
                ) as roles
         FROM admins a
         LEFT JOIN role_admin ra ON a.id = ra.admin_id
         LEFT JOIN roles r ON ra.role_id = r.id
         ${whereClause}
         GROUP BY a.id, a.name, a.email, a.status, a.is_super_admin, a.created_at
         ORDER BY a.created_at DESC
         LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
        [...queryParams, limit, offset]
      );

      // Get permissions for each admin
      const adminsWithPermissions = await Promise.all(
        adminsResult.rows.map(async (admin) => {
          const permissionsArray = await Admin.getPermissions(admin.id);
          const permissions = groupPermissionsByModule(permissionsArray);

          return {
            ...admin,
            permissions
          };
        })
      );

      return {
        data: adminsWithPermissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('AdminService getAllAdmins error:', error);
      throw error;
    }
  }

  static async getAdminById(id) {
    try {
      const admin = await Admin.findById(id);
      if (!admin) {
        throw new Error('Admin not found');
      }

      const roles = await Admin.getRoles(id);
      const permissionsArray = await Admin.getPermissions(id);
      const permissions = groupPermissionsByModule(permissionsArray);

      return {
        ...admin,
        roles,
        permissions
      };
    } catch (error) {
      logger.error('AdminService getAdminById error:', error);
      throw error;
    }
  }

  static async updateAdmin(id, adminData) {
    try {
      const { name, status, isSuperAdmin, roleIds, permissionIds } = adminData;

      // Check if admin exists
      const existingAdmin = await Admin.findById(id);
      if (!existingAdmin) {
        throw new Error('Admin not found');
      }

      // Update admin basic info
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (status !== undefined) updateData.status = status;
      if (isSuperAdmin !== undefined) updateData.is_super_admin = isSuperAdmin;

      if (Object.keys(updateData).length > 0) {
        await Admin.update(id, updateData);
      }

      // Update roles
      if (roleIds !== undefined) {
        await query('DELETE FROM role_admin WHERE admin_id = $1', [id]);

        if (roleIds.length > 0) {
          const roleQueries = roleIds.map(roleId =>
            query('INSERT INTO role_admin (admin_id, role_id) VALUES ($1, $2)', [id, roleId])
          );
          await Promise.all(roleQueries);
        }
      }

      // Update permissions
      if (permissionIds !== undefined) {
        await query('DELETE FROM permission_admin WHERE admin_id = $1', [id]);

        if (permissionIds.length > 0) {
          const permissionQueries = permissionIds.map(permissionId =>
            query('INSERT INTO permission_admin (admin_id, permission_id) VALUES ($1, $2)', [id, permissionId])
          );
          await Promise.all(permissionQueries);
        }
      }

      logger.info(`Admin updated successfully: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('AdminService updateAdmin error:', error);
      throw error;
    }
  }

  static async deleteAdmin(id, currentAdminId) {
    try {
      // Check if admin exists
      const existingAdmin = await Admin.findById(id);
      if (!existingAdmin) {
        throw new Error('Admin not found');
      }

      // Prevent deleting yourself
      if (id == currentAdminId) {
        throw new Error('Cannot delete yourself');
      }

      await Admin.delete(id);
      logger.info(`Admin deleted successfully: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('AdminService deleteAdmin error:', error);
      throw error;
    }
  }
}