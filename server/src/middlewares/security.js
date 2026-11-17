import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from '../config/environment.js';

export const configureSecurityMiddlewares = (app) => {
  // 1. Helmet for secure HTTP headers
  app.use(helmet());

  // 2. CORS configuration restricted to authorized frontend origin
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching CLIENT_URL
        if (!origin || origin === env.CLIENT_URL || env.isDevelopment) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked for origin: ${origin}`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  // 3. NoSQL Injection protection (sanitize body, query, and params)
  app.use(
    mongoSanitize({
      replaceWith: '_'
    })
  );

  // 4. Rate Limiting to prevent brute-force attacks and abuse
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again after 15 minutes.'
    }
  });

  app.use('/api', limiter);
};
