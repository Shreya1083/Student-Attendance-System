import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { loginRateLimiter } from '../middlewares/authRateLimiter.js';
import { validate } from '../validators/index.js';
import { loginSchema, changePasswordSchema, registerSchema } from '../validators/authValidator.js';

const router = Router();

// POST /api/v1/auth/register (Public student registration with validation and rate limiting)
router.post('/register', loginRateLimiter, validate(registerSchema), authController.register);

// GET /api/v1/auth/academic-options (Public lookup for department, semester, and section dropdowns)
router.get('/academic-options', authController.getAcademicOptions);

// POST /api/v1/auth/login (Rate limited to 5 attempts per 15 min + validated)
router.post('/login', loginRateLimiter, validate(loginSchema), authController.login);

// GET /api/v1/auth/me (Protected: returns current user profile)
router.get('/me', authenticate, authController.getCurrentUser);

// POST /api/v1/auth/change-password (Protected: verifies current password & updates)
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

// POST /api/v1/auth/logout (Protected: invalidates token)
router.post('/logout', authenticate, authController.logout);

export default router;
