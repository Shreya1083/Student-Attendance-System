import User from '../models/User.js';
import { generateToken, blacklistToken } from './tokenService.js';

export const loginUser = async ({ email, password }) => {
  // 1. Fetch user by email, explicitly including password field for verification
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // 2. Reject inactive accounts
  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact an administrator.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Verify password hash using bcrypt
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // 4. Update last login timestamp
  user.lastLogin = new Date();
  await user.save();

  // 5. Generate signed JWT token
  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated');
    error.statusCode = 403;
    throw error;
  }

  return user.toJSON();
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  // Update password and increment token version to invalidate existing tokens
  user.password = newPassword;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  // Generate a new token with updated tokenVersion
  const newToken = generateToken(user);

  return {
    message: 'Password changed successfully',
    token: newToken
  };
};

export const logoutUser = async (userId, token) => {
  // 1. Blacklist token immediately in-memory
  if (token) {
    blacklistToken(token);
  }

  // 2. Increment tokenVersion in database if user ID is provided
  if (userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: { tokenVersion: 1 }
      });
    } catch {
      // Continue even if DB update encounters transient issue
    }
  }

  return {
    message: 'Successfully logged out'
  };
};
