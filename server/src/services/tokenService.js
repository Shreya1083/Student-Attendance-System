import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';

// In-memory blacklist for invalidated tokens (cleared on server restart or token expiration)
const tokenBlacklist = new Map(); // token -> expiryTimestamp

// Cleanup expired tokens from blacklist every 30 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of tokenBlacklist.entries()) {
    if (now > expiry) {
      tokenBlacklist.delete(token);
    }
  }
}, 30 * 60 * 1000);

// Unref timer so it does not block Node process exit during tests/shutdown
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

/**
 * Generate a signed JWT for an authenticated user
 */
export const generateToken = (user) => {
  const payload = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
    tokenVersion: user.tokenVersion || 0
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '8h'
  });
};

/**
 * Verify and decode a JWT token
 */
export const verifyJwtToken = (token) => {
  if (isTokenBlacklisted(token)) {
    const error = new Error('Token has been invalidated. Please log in again.');
    error.name = 'TokenInvalidatedError';
    throw error;
  }

  return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Blacklist a token upon logout
 */
export const blacklistToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      // Store until the JWT would naturally expire
      tokenBlacklist.set(token, decoded.exp * 1000);
    } else {
      // Fallback: store for 8 hours
      tokenBlacklist.set(token, Date.now() + 8 * 60 * 60 * 1000);
    }
  } catch {
    tokenBlacklist.set(token, Date.now() + 8 * 60 * 60 * 1000);
  }
};

/**
 * Check if a token is in the blacklist
 */
export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};
