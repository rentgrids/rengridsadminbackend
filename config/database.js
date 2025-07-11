import pkg from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info('✅ PostgreSQL connected successfully');
    client.release();
  } catch (error) {
    logger.error('❌ PostgreSQL connection failed:', error.message);
    process.exit(1);
  }
};

// Query helper
export const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
};