import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

export const connectSequelize = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Sequelize connected to PostgreSQL successfully');
  } catch (error) {
    logger.error('❌ Sequelize connection failed:', error.message);
    process.exit(1);
  }
};

export default sequelize;