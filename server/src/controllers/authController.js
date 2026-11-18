import * as authService from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { env } from '../config/environment.js';

// Cookie configuration options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction, // Secure in production HTTPS
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000 // 8 hours in milliseconds
});

export const login = async (req, res, next) => {
  try {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      return errorResponse(res, {
        statusCode: 503,
        message: 'Database service is currently offline. Please ensure MongoDB is running to authenticate.'
      });
    }

    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    // Set secure HttpOnly cookie for browsers
    res.cookie('token', result.token, getCookieOptions());

    return successResponse(res, {
      statusCode: 200,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, {
        statusCode: error.statusCode,
        message: error.message
      });
    }
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    // req.user was populated by authenticate middleware
    return successResponse(res, {
      statusCode: 200,
      message: 'Current authenticated user profile retrieved successfully',
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      return errorResponse(res, {
        statusCode: 503,
        message: 'Database service is currently offline. Please ensure MongoDB is running to update password.'
      });
    }

    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user._id, {
      currentPassword,
      newPassword
    });

    // Update cookie with new token
    res.cookie('token', result.token, getCookieOptions());

    return successResponse(res, {
      statusCode: 200,
      message: result.message,
      data: { token: result.token }
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, {
        statusCode: error.statusCode,
        message: error.message
      });
    }
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const token = req.token;

    const result = await authService.logoutUser(userId, token);

    // Clear authentication cookie
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax'
    });

    return successResponse(res, {
      statusCode: 200,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      return errorResponse(res, {
        statusCode: 503,
        message: 'Database service is currently offline. Please ensure MongoDB is running to register.'
      });
    }

    const result = await authService.registerStudent(req.body);

    // Set secure HttpOnly cookie for browsers
    res.cookie('token', result.token, getCookieOptions());

    return successResponse(res, {
      statusCode: 201,
      message: 'Student account registered successfully',
      data: result
    });
  } catch (error) {
    if (error.statusCode) {
      return errorResponse(res, {
        statusCode: error.statusCode,
        message: error.message
      });
    }
    next(error);
  }
};

export const getAcademicOptions = async (req, res, next) => {
  try {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      return errorResponse(res, {
        statusCode: 503,
        message: 'Database service is currently offline.'
      });
    }

    const options = await authService.getAcademicOptions();
    return successResponse(res, {
      statusCode: 200,
      message: 'Academic options retrieved successfully',
      data: options
    });
  } catch (error) {
    next(error);
  }
};
