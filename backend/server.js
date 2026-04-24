require('dotenv').config();
const app = require('./app');
const { logger } = require('./middleware/errorHandler');
const db = require('./config/database');

const PORT = process.env.PORT || 3000;

// Test database connection
const testConnection = async () => {
  try {
    const client = await db.connect();
    client.release();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    return false;
  }
};

// Start server
const startServer = async () => {
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    logger.warn('Starting server without database connection...');
  }
  
  app.listen(PORT, () => {
    logger.info(`AgriSmart Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();