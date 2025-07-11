import { AdminService } from '../services/AdminService.js';
import { formatResponse } from '../utils/helpers.js';
import { validateRequest } from '../middleware/validation.js';
import { createAdminSchema, updateAdminSchema, createRoleSchema, createPermissionSchema } from '../utils/validators/adminValidators.js';
import { verifyAdminJWT, requirePermission } from '../middleware/auth.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export class AdminController {
  // Admin CRUD
  static createAdmin = [
    verifyAdminJWT,
    requirePermission('admin', 'create'),
    validateRequest(createAdminSchema),
    async (req, res) => {
      try {
        const result = await AdminService.createAdmin(req.body);
        res.status(201).json(formatResponse(true, 'Admin created successfully', result));
      } catch (error) {
        logger.error('AdminController createAdmin error:', error);
        res.status(400).json(formatResponse(false, error.message));
      }
    }
  ];

  static getAllAdmins = [
    verifyAdminJWT,
    requirePermission('admin', 'view'),
    async (req, res) => {
      try {
        const filters = {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10,
          search: req.query.search || ''
        };
        
        const result = await AdminService.getAllAdmins(filters);
        res.json(formatResponse(true, 'Admins retrieved successfully', result));
      } catch (error) {
        logger.error('AdminController getAllAdmins error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve admins'));
      }
    }
  ];

  static getAdminById = [
    verifyAdminJWT,
    requirePermission('admin', 'view'),
    async (req, res) => {
      try {
        const adminId = req.params.id;
        const result = await AdminService.getAdminById(adminId);
        res.json(formatResponse(true, 'Admin retrieved successfully', result));
      } catch (error) {
        logger.error('AdminController getAdminById error:', error);
        if (error.message === 'Admin not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(500).json(formatResponse(false, 'Failed to retrieve admin'));
        }
      }
    }
  ];

  static updateAdmin = [
    verifyAdminJWT,
    requirePermission('admin', 'edit'),
    validateRequest(updateAdminSchema),
    async (req, res) => {
      try {
        const adminId = req.params.id;
        await AdminService.updateAdmin(adminId, req.body);
        res.json(formatResponse(true, 'Admin updated successfully'));
      } catch (error) {
        logger.error('AdminController updateAdmin error:', error);
        if (error.message === 'Admin not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(400).json(formatResponse(false, error.message));
        }
      }
    }
  ];

  static deleteAdmin = [
    verifyAdminJWT,
    requirePermission('admin', 'delete'),
    async (req, res) => {
      try {
        const adminId = req.params.id;
        await AdminService.deleteAdmin(adminId, req.admin.id);
        res.json(formatResponse(true, 'Admin deleted successfully'));
      } catch (error) {
        logger.error('AdminController deleteAdmin error:', error);
        if (error.message === 'Admin not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(400).json(formatResponse(false, error.message));
        }
      }
    }
  ];

  // Role Management
  static createRole = [
    verifyAdminJWT,
    requirePermission('role', 'create'),
    validateRequest(createRoleSchema),
    async (req, res) => {
      try {
        const { name, slug, description, permissionIds } = req.body;
        const { generateSlug } = await import('../utils/helpers.js');
        const roleSlug = slug || generateSlug(name);

        // Check if role already exists
        const existingRole = await query('SELECT id FROM roles WHERE slug = $1', [roleSlug]);
        if (existingRole.rows.length > 0) {
          return res.status(400).json(formatResponse(false, 'Role with this slug already exists'));
        }

        // Create role
        const roleResult = await query(
          'INSERT INTO roles (name, slug, description) VALUES ($1, $2, $3) RETURNING id',
          [name, roleSlug, description]
        );

        const roleId = roleResult.rows[0].id;

        // Assign permissions
        if (permissionIds && permissionIds.length > 0) {
          const permissionQueries = permissionIds.map(permissionId => 
            query('INSERT INTO permission_role (role_id, permission_id) VALUES ($1, $2)', [roleId, permissionId])
          );
          await Promise.all(permissionQueries);
        }

        res.status(201).json(formatResponse(true, 'Role created successfully', { roleId }));
      } catch (error) {
        logger.error('AdminController createRole error:', error);
        res.status(500).json(formatResponse(false, 'Failed to create role'));
      }
    }
  ];

  static getAllRoles = [
    verifyAdminJWT,
    requirePermission('role', 'view'),
    async (req, res) => {
      try {
        const rolesResult = await query(`
          SELECT r.id, r.name, r.slug, r.description, r.created_at
          FROM roles r
          ORDER BY r.created_at DESC
        `);

        // Get permissions for each role
        const { groupPermissionsByModule } = await import('../utils/helpers.js');
        const rolesWithPermissions = await Promise.all(
          rolesResult.rows.map(async (role) => {
            const permissionsResult = await query(`
              SELECT p.module, p.action 
              FROM permissions p
              JOIN permission_role pr ON p.id = pr.permission_id
              WHERE pr.role_id = $1
            `, [role.id]);

            const permissions = groupPermissionsByModule(permissionsResult.rows);
            
            return {
              ...role,
              permissions
            };
          })
        );

        res.json(formatResponse(true, 'Roles retrieved successfully', rolesWithPermissions));
      } catch (error) {
        logger.error('AdminController getAllRoles error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve roles'));
      }
    }
  ];

  // Permission Management
  static createPermission = [
    verifyAdminJWT,
    requirePermission('permission', 'create'),
    validateRequest(createPermissionSchema),
    async (req, res) => {
      try {
        const { name, module, action, description } = req.body;

        // Check if permission already exists
        const existingPermission = await query('SELECT id FROM permissions WHERE name = $1', [name]);
        if (existingPermission.rows.length > 0) {
          return res.status(400).json(formatResponse(false, 'Permission already exists'));
        }

        // Create permission
        const permissionResult = await query(
          'INSERT INTO permissions (name, module, action, description) VALUES ($1, $2, $3, $4) RETURNING id',
          [name, module, action, description]
        );

        const permissionId = permissionResult.rows[0].id;
        res.status(201).json(formatResponse(true, 'Permission created successfully', { permissionId }));
      } catch (error) {
        logger.error('AdminController createPermission error:', error);
        res.status(500).json(formatResponse(false, 'Failed to create permission'));
      }
    }
  ];

  static getAllPermissions = [
    verifyAdminJWT,
    requirePermission('permission', 'view'),
    async (req, res) => {
      try {
        const permissionsResult = await query(`
          SELECT id, name, module, action, description, created_at
          FROM permissions
          ORDER BY module, action
        `);

        res.json(formatResponse(true, 'Permissions retrieved successfully', permissionsResult.rows));
      } catch (error) {
        logger.error('AdminController getAllPermissions error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve permissions'));
      }
    }
  ];
}