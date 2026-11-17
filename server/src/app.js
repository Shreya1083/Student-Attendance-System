import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/environment.js';
import { configureSecurityMiddlewares } from './middlewares/security.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/errorHandler.js';
import apiV1Routes from './routes/index.js';

const app = express();

// HTTP request logger
if (env.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request body parsing with strict size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parsing for HttpOnly JWT tokens
app.use(cookieParser());

// Security middlewares (Helmet, CORS, Mongo Sanitize, General Rate Limiter)
configureSecurityMiddlewares(app);

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Student Attendance and Notification System API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/v1/health'
  });
});

// Mount API v1 router
app.use('/api/v1', apiV1Routes);

// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Centralized error handler
app.use(globalErrorHandler);

export default app;
