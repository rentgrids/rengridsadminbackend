import { formatResponse } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      logger.warn(`Validation error: ${error.details[0].message}`);
      return res.status(400).json(formatResponse(false, error.details[0].message));
    }
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      logger.warn(`Query validation error: ${error.details[0].message}`);
      return res.status(400).json(formatResponse(false, error.details[0].message));
    }
    next();
  };
};