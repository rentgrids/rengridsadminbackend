import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export const generateJWT = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });
  } catch (error) {
    logger.error('JWT generation error:', error);
    throw error;
  }
};

export const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error('JWT verification error:', error);
    throw error;
  }
};