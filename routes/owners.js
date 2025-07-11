import express from 'express';
import { EnhancedPropertyController } from '../controllers/EnhancedPropertyController.js';

const router = express.Router();

// Owner-specific property routes
router.get('/:ownerId/properties', EnhancedPropertyController.getOwnerProperties);

export default router;