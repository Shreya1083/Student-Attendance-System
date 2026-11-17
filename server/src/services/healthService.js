import os from 'os';
import { getDBStatus } from '../config/db.js';
import { env } from '../config/environment.js';

export const getSystemHealth = () => {
  const dbStatus = getDBStatus();
  const uptimeSeconds = process.uptime();

  return {
    status: dbStatus.status === 'connected' ? 'healthy' : 'operational_without_db',
    service: 'student-attendance-notification-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptimeSeconds),
      formatted: `${Math.floor(uptimeSeconds / 60)}m ${Math.floor(uptimeSeconds % 60)}s`
    },
    environment: env.NODE_ENV,
    database: {
      ...dbStatus,
      isReady: dbStatus.stateCode === 1
    },
    system: {
      platform: os.platform(),
      nodeVersion: process.version,
      memoryUsageMB: {
        rss: (process.memoryUsage().rss / (1024 * 1024)).toFixed(2),
        heapUsed: (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2),
        heapTotal: (process.memoryUsage().heapTotal / (1024 * 1024)).toFixed(2)
      }
    }
  };
};
