import { UserService } from '../services/UserService.js';
import { formatResponse } from '../utils/helpers.js';
import { validateRequest } from '../middleware/validation.js';
import { createUserSchema, updateUserSchema, updateStatusSchema, updateBlockSchema } from '../utils/validators/userValidators.js';
import { verifyAdminJWT, requirePermission } from '../middleware/auth.js';
import logger from '../utils/logger.js';

export class UserController {
  static getAllUsers = [
    verifyAdminJWT,
    requirePermission('user', 'view'),
    async (req, res) => {
      try {
        const filters = {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10,
          search: req.query.search || '',
          status: req.query.status || '',
          user_type: req.query.user_type || '',
          is_blocked: req.query.is_blocked || ''
        };
        
        const result = await UserService.getAllUsers(filters);
        res.json(formatResponse(true, 'Users retrieved successfully', result));
      } catch (error) {
        logger.error('UserController getAllUsers error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve users'));
      }
    }
  ];

  static getUserById = [
    verifyAdminJWT,
    requirePermission('user', 'view'),
    async (req, res) => {
      try {
        const userId = req.params.id;
        const result = await UserService.getUserById(userId);
        res.json(formatResponse(true, 'User retrieved successfully', result));
      } catch (error) {
        logger.error('UserController getUserById error:', error);
        if (error.message === 'User not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(500).json(formatResponse(false, 'Failed to retrieve user'));
        }
      }
    }
  ];

  static createUser = [
    verifyAdminJWT,
    requirePermission('user', 'create'),
    async (req, res) => {
      try {
        // Handle both JSON and form-data
        const userData = req.body;
        
        const result = await UserService.createUser(userData);
        res.status(201).json(formatResponse(true, 'User created successfully', result));
      } catch (error) {
        logger.error('UserController createUser error:', error);
        res.status(400).json(formatResponse(false, error.message));
      }
    }
  ];

  static updateUser = [
    verifyAdminJWT,
    requirePermission('user', 'edit'),
    async (req, res) => {
      try {
        const userId = req.params.id;
        const userData = req.body;
        
        await UserService.updateUser(userId, userData);
        res.json(formatResponse(true, 'User updated successfully'));
      } catch (error) {
        logger.error('UserController updateUser error:', error);
        if (error.message === 'User not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(400).json(formatResponse(false, error.message));
        }
      }
    }
  ];

  static updateUserStatus = [
    verifyAdminJWT,
    requirePermission('user', 'edit'),
    validateRequest(updateStatusSchema),
    async (req, res) => {
      try {
        const userId = req.params.id;
        const { status } = req.body;
        await UserService.updateUserStatus(userId, status);
        res.json(formatResponse(true, `User status updated to ${status}`));
      } catch (error) {
        logger.error('UserController updateUserStatus error:', error);
        if (error.message === 'User not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(500).json(formatResponse(false, 'Failed to update user status'));
        }
      }
    }
  ];

  static updateUserBlockStatus = [
    verifyAdminJWT,
    requirePermission('user', 'edit'),
    validateRequest(updateBlockSchema),
    async (req, res) => {
      try {
        const userId = req.params.id;
        const { is_blocked } = req.body;
        const result = await UserService.updateUserBlockStatus(userId, is_blocked);
        res.json(formatResponse(true, result.message));
      } catch (error) {
        logger.error('UserController updateUserBlockStatus error:', error);
        if (error.message === 'User not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(500).json(formatResponse(false, 'Failed to update user block status'));
        }
      }
    }
  ];

  static deleteUser = [
    verifyAdminJWT,
    requirePermission('user', 'delete'),
    async (req, res) => {
      try {
        const userId = req.params.id;
        await UserService.deleteUser(userId);
        res.json(formatResponse(true, 'User deleted successfully'));
      } catch (error) {
        logger.error('UserController deleteUser error:', error);
        if (error.message === 'User not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(500).json(formatResponse(false, 'Failed to delete user'));
        }
      }
    }
  ];

  static bulkDeleteUsers = [
    verifyAdminJWT,
    requirePermission('user', 'delete'),
    async (req, res) => {
      try {
        const { userIds } = req.body;
        
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
          return res.status(400).json(formatResponse(false, 'User IDs array is required'));
        }

        const result = await UserService.bulkDeleteUsers(userIds);
        res.json(formatResponse(true, `${result.deletedCount} users deleted successfully`, result));
      } catch (error) {
        logger.error('UserController bulkDeleteUsers error:', error);
        res.status(500).json(formatResponse(false, 'Failed to delete users'));
      }
    }
  ];

  static getUserLoginHistory = [
    verifyAdminJWT,
    requirePermission('user', 'view'),
    async (req, res) => {
      try {
        const userId = req.params.id;
        const filters = {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10
        };
        
        const result = await UserService.getUserLoginHistory(userId, filters);
        res.json(formatResponse(true, 'Login history retrieved successfully', result));
      } catch (error) {
        logger.error('UserController getUserLoginHistory error:', error);
        if (error.message === 'User not found') {
          res.status(404).json(formatResponse(false, error.message));
        } else {
          res.status(500).json(formatResponse(false, 'Failed to retrieve login history'));
        }
      }
    }
  ];

  static getUserStats = [
    verifyAdminJWT,
    requirePermission('user', 'view'),
    async (req, res) => {
      try {
        const result = await UserService.getUserStats();
        res.json(formatResponse(true, 'User statistics retrieved successfully', result));
      } catch (error) {
        logger.error('UserController getUserStats error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve user statistics'));
      }
    }
  ];

  static exportUsers = [
    verifyAdminJWT,
    requirePermission('user', 'view'),
    async (req, res) => {
      try {
        const filters = {
          status: req.query.status || '',
          user_type: req.query.user_type || '',
          is_blocked: req.query.is_blocked || ''
        };
        
        const result = await UserService.exportUsers(filters);
        res.json(formatResponse(true, 'Users exported successfully', result));
      } catch (error) {
        logger.error('UserController exportUsers error:', error);
        res.status(500).json(formatResponse(false, 'Failed to export users'));
      }
    }
  ];
}