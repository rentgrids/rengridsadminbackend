import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import configurations
import { connectDB } from './config/database.js';
import { connectSequelize } from './config/sequelize.js';
import logger from './utils/logger.js';

// Import routes
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/users.js';
import propertyRoutes from './routes/properties.js';
import enhancedPropertyRoutes from './routes/enhancedProperties.js';
import ownerRoutes from './routes/owners.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Test database connections
connectDB();
connectSequelize();

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/properties', propertyRoutes); // Original property routes
app.use('/api/properties', enhancedPropertyRoutes); // Enhanced property routes with Sequelize
app.use('/api/owners', ownerRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'Connected',
    sequelize: 'Connected'
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`📁 Static files: http://localhost:${PORT}/uploads`);
});