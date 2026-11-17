/**
 * Standardized API success response
 */
export const successResponse = (res, { statusCode = 200, message = 'Success', data = null, meta = null }) => {
  const payload = {
    success: true,
    message,
    data
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Standardized API error response
 */
export const errorResponse = (res, { statusCode = 500, message = 'Internal Server Error', errors = null, code = null }) => {
  const payload = {
    success: false,
    message
  };

  if (errors) {
    payload.errors = errors;
  }

  if (code) {
    payload.code = code;
  }

  return res.status(statusCode).json(payload);
};
