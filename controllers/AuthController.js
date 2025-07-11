import { AuthService } from '../services/AuthService.js';
import { formatResponse } from '../utils/helpers.js';
import { validateRequest } from '../middleware/validation.js';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validators/authValidators.js';
import logger from '../utils/logger.js';

export class AuthController {
  static login = [
    validateRequest(loginSchema),
    async (req, res) => {
      try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password, req);
        res.json(formatResponse(true, 'Login successful', result));
      } catch (error) {
        logger.error('AuthController login error:', error);
        res.status(401).json(formatResponse(false, error.message));
      }
    }
  ];

  static forgotPassword = [
    validateRequest(forgotPasswordSchema),
    async (req, res) => {
      try {
        const { email } = req.body;
        await AuthService.forgotPassword(email, req);
        res.json(formatResponse(true, 'If the email exists, you will receive a password reset link'));
      } catch (error) {
        logger.error('AuthController forgotPassword error:', error);
        res.status(500).json(formatResponse(false, 'Failed to process forgot password request'));
      }
    }
  ];

  static resetPassword = [
    validateRequest(resetPasswordSchema),
    async (req, res) => {
      try {
        const { email, token, password } = req.body;
        await AuthService.resetPassword(email, token, password);
        res.json(formatResponse(true, 'Password reset successfully'));
      } catch (error) {
        logger.error('AuthController resetPassword error:', error);
        res.status(400).json(formatResponse(false, error.message));
      }
    }
  ];
}