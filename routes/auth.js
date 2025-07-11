import express from 'express';
import { AuthController } from '../controllers/AuthController.js';

const router = express.Router();

// Authentication routes
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;