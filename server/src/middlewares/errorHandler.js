import { env } from '../config/environment.js';
import { logger } from '../utils/logger.js';
import { errorResponse } from '../utils/apiResponse.js';

export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, {
    statusCode: 404,
    message: `Resource not found: [${req.method}] ${req.originalUrl}`
  });
};

export const globalErrorHandler = (err, req, res, next) => {
  logger.error(`Unhandled Request Error: ${err.message}`, err.stack);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  const responsePayload = {
    statusCode,
    message: err.message || 'An unexpected internal server error occurred.'
  };

  if (err.errors) {
    responsePayload.errors = err.errors;
  }

  if (env.isDevelopment) {
    responsePayload.code = err.code || 'DEV_INTERNAL_ERROR';
    // Include debug stack trace in development
    return res.status(statusCode).json({
      success: false,
      message: responsePayload.message,
      errors: responsePayload.errors || null,
      stack: err.stack
    });
  }

  return errorResponse(res, responsePayload);
};
