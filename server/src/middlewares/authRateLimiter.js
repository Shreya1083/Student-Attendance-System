import rateLimit from 'express-rate-limit';
import { env } from '../config/environment.js';

/**
 * Rate limiter for authentication endpoints:
 * Enforces maximum 5 attempts per 15 minutes in production, relaxed in development.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.isDevelopment ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});
