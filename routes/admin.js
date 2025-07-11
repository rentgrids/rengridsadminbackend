import express from 'express';
import { AdminController } from '../controllers/AdminController.js';

const router = express.Router();

// Admin CRUD Operations
router.post('/admins', AdminController.createAdmin);
router.get('/admins', AdminController.getAllAdmins);
router.get('/admins/:id', AdminController.getAdminById);
router.put('/admins/:id', AdminController.updateAdmin);
router.delete('/admins/:id', AdminController.deleteAdmin);

// Role Management
router.post('/roles', AdminController.createRole);
router.get('/roles', AdminController.getAllRoles);

// Permission Management
router.post('/permissions', AdminController.createPermission);
router.get('/permissions', AdminController.getAllPermissions);

export default router;