import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from '../config/database.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const setupDatabase = async () => {
    try {
        logger.info('🚀 Setting up database schema...');

        // Read and execute schema file
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf8');

        await pool.query(schema);

        logger.info('✅ Database schema created successfully!');
        logger.info('📝 You can now run: npm run seed');

    } catch (error) {
        logger.error('❌ Database setup failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
};

// Run setup
setupDatabase()
    .then(() => {
        logger.info('✅ Setup completed');
        process.exit(0);
    })
    .catch((error) => {
        logger.error('❌ Setup failed:', error);
        process.exit(1);
    });