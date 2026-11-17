import app from './app.js';
import { env } from './config/environment.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    // Attempt database connection
    await connectDB();

    const server = app.listen(env.PORT, () => {
      logger.info(`=======================================================`);
      logger.info(`  Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
      logger.info(`  Health check: http://localhost:${env.PORT}/api/v1/health`);
      logger.info(`  Client allowed origin: ${env.CLIENT_URL}`);
      logger.info(`=======================================================`);
    });

    // Graceful shutdown handling
    const shutdown = (signal) => {
      logger.warn(`Received ${signal}. Gracefully shutting down HTTP server...`);
      server.close(() => {
        logger.info('HTTP server closed. Exiting process.');
        process.exit(0);
      });

      // Force close after 10 seconds if hanging
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error(`Fatal Server Startup Failure: ${err.message}`, err.stack);
    process.exit(1);
  }
};

startServer();
