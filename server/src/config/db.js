import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { env } from './environment.js';
import { logger } from '../utils/logger.js';

let memoryServer = null;

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
    // 1. Try standard connection to configured MONGODB_URI
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });

    logger.info(`MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    await autoSeedIfNeeded();
    return conn;
  } catch (error) {
    logger.warn(`Configured MongoDB URI (${env.MONGODB_URI}) unreachable: ${error.message}`);
    logger.info('Initializing embedded persistent MongoDB engine for development...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const dbDir = path.resolve('data/db');
      fs.mkdirSync(dbDir, { recursive: true });

      // Attempt port 27017 first, fallback to open port if busy
      try {
        memoryServer = await MongoMemoryServer.create({
          instance: {
            port: 27017,
            dbName: 'student_attendance_db',
            dbPath: dbDir
          }
        });
      } catch (portErr) {
        logger.warn(`Port 27017 busy, allocating alternative port: ${portErr.message}`);
        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'student_attendance_db',
            dbPath: dbDir
          }
        });
      }

      const uri = memoryServer.getUri();
      const conn = await mongoose.connect(uri);
      logger.info(`Embedded MongoDB running & connected: ${uri} (dbPath: ${dbDir})`);

      await autoSeedIfNeeded();
      return conn;
    } catch (fallbackErr) {
      logger.error(`Embedded MongoDB failed to start: ${fallbackErr.message}`);
      return null;
    }
  }
};

const autoSeedIfNeeded = async () => {
  try {
    const { default: User } = await import('../models/User.js');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('Database is empty. Automatically initializing default seed records...');
      const { seedUsers } = await import('../utils/seedUsers.js');
      await seedUsers();
      logger.info('Default seed records initialized successfully.');
    }
  } catch (seedErr) {
    logger.warn(`Auto-seed check: ${seedErr.message}`);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  } catch (err) {
    logger.error(`Error closing database: ${err.message}`);
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
