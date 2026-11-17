import { verifyJwtToken, isTokenBlacklisted } from '../services/tokenService.js';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Authentication Middleware:
 * Validates JWT token from Authorization header or HttpOnly cookie,
 * checks token blacklist, loads user profile, and ensures user is active.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // 2. Check HttpOnly cookie fallback
      token = req.cookies.token;
    }

    if (!token) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Authentication required. No token provided.'
      });
    }

    // 3. Verify blacklist status
    if (isTokenBlacklisted(token)) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Token has been invalidated. Please log in again.'
      });
    }

    // 4. Verify and decode JWT
    let decoded;
    try {
      decoded = verifyJwtToken(token);
    } catch (err) {
      return errorResponse(res, {
        statusCode: 401,
        message: err.name === 'TokenExpiredError' 
          ? 'Authentication token has expired. Please log in again.' 
          : 'Invalid authentication token.'
      });
    }

    // 5. Check database availability
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      return errorResponse(res, {
        statusCode: 503,
        message: 'Database service is currently offline. Please ensure MongoDB is started to verify account status.'
      });
    }

    // 6. Query user from database to verify active status and token version
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'User account associated with this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    // Check token version against user's current token version (invalidates tokens on password change or explicit logout)
    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Session has expired due to password change or logout. Please log in again.'
      });
    }

    // Attach user and token to request object
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control Middleware:
 * Restricts access to one or more allowed roles ('ADMIN', 'FACULTY', 'STUDENT').
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Authentication required before checking authorization.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: `Forbidden: Access denied. Required role(s): [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`
      });
    }

    next();
  };
};
