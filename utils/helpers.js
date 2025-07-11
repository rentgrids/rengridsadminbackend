import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import logger from './logger.js';

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  } catch (error) {
    logger.error('Password hashing error:', error);
    throw error;
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error('Password comparison error:', error);
    throw error;
  }
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateTokenExpiry = (minutes = 30) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

export const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

export const formatResponse = (success, message, data = null) => {
  const response = { success, message };
  if (data) response.data = data;
  return response;
};

export const groupPermissionsByModule = (permissions) => {
  const grouped = {};
  permissions.forEach(permission => {
    if (!grouped[permission.module]) {
      grouped[permission.module] = [];
    }
    grouped[permission.module].push(permission.action);
  });
  return grouped;
};

export const generateSlug = (text) => {
  if (typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit, offset };
};