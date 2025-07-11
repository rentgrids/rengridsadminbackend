import express from 'express';
import { UserController } from '../controllers/UserController.js';

const router = express.Router();

// User Management Routes
router.get('/', UserController.getAllUsers);
router.get('/stats', UserController.getUserStats);
router.get('/export', UserController.exportUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.patch('/:id/status', UserController.updateUserStatus);
router.patch('/:id/block', UserController.updateUserBlockStatus);
router.delete('/:id', UserController.deleteUser);
router.post('/bulk-delete', UserController.bulkDeleteUsers);
router.get('/:id/logins', UserController.getUserLoginHistory);

export default router;