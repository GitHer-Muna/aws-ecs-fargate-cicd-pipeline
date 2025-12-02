import app from './app';
import config from './config';
import logger from './utils/logger';
import prisma from './database/client';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✓ Database connected successfully');

    // Start server
    const server = app.listen(config.port, () => {
      logger.info('='.repeat(50));
      logger.info(`🚀 CloudCare Ticketing Service Started`);
      logger.info('='.repeat(50));
      logger.info(`Environment: ${config.env}`);
      logger.info(`Port: ${config.port}`);
      logger.info(`API: http://localhost:${config.port}${config.apiPrefix}`);
      logger.info(`Health: http://localhost:${config.port}${config.apiPrefix}/health`);
      if (config.monitoring.enableMetrics) {
        logger.info(`Metrics: http://localhost:${config.port}/metrics`);
      }
      logger.info('='.repeat(50));
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
