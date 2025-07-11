import { verifyJWT } from '../config/jwt.js';
import { query } from '../config/database.js';
import { formatResponse } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export const verifyAdminJWT = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json(formatResponse(false, 'Access token required'));
    }

    const decoded = verifyJWT(token);
    
    // Check if admin still exists and is active
    const result = await query(
      'SELECT id, name, email, status, is_super_admin FROM admins WHERE id = $1 AND status = $2',
      [decoded.adminId, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json(formatResponse(false, 'Invalid token or admin not found'));
    }

    req.admin = result.rows[0];
    next();
  } catch (error) {
    logger.error('JWT verification error:', error);
    return res.status(401).json(formatResponse(false, 'Invalid token'));
  }
};

export const requirePermission = (module, action) => {
  return async (req, res, next) => {
    try {
      const adminId = req.admin.id;
      
      // Super admin has all permissions
      if (req.admin.is_super_admin) {
        return next();
      }

      // Check if admin has permission directly or through roles
      const permissionQuery = `
        SELECT DISTINCT p.id 
        FROM permissions p
        WHERE p.module = $1 AND p.action = $2
        AND (
          p.id IN (
            SELECT pa.permission_id 
            FROM permission_admin pa 
            WHERE pa.admin_id = $3
          )
          OR p.id IN (
            SELECT pr.permission_id 
            FROM permission_role pr
            JOIN role_admin ra ON pr.role_id = ra.role_id
            WHERE ra.admin_id = $3
          )
        )
      `;

      const result = await query(permissionQuery, [module, action, adminId]);

      if (result.rows.length === 0) {
        logger.warn(`Permission denied for admin ${adminId}: ${module}.${action}`);
        return res.status(403).json(formatResponse(false, 'Insufficient permissions'));
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      return res.status(500).json(formatResponse(false, 'Permission check failed'));
    }
  };
};