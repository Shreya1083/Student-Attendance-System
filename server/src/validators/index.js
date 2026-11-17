import { z } from 'zod';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Middleware factory for validating incoming request parts using Zod schemas
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));

        return errorResponse(res, {
          statusCode: 400,
          message: 'Validation failed',
          errors: formattedErrors
        });
      }
      next(err);
    }
  };
};
