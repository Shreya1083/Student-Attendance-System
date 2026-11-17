import mongoose from 'mongoose';
import { env } from './environment.js';
import { logger } from '../utils/logger.js';

const connectionStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

export const getDBStatus = () => {
  const stateCode = mongoose.connection.readyState;
  return {
    stateCode,
    status: connectionStates[stateCode] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s if MongoDB is not running locally
    });

    logger.info(`MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    logger.warn('Server will continue running. Ensure MongoDB service is started for database operations.');
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB runtime connection error: ${err.message}`);
});
