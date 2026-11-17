import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

// Test route strictly for ADMIN role
router.get('/admin-only', authenticate, authorize('ADMIN'), (req, res) => {
  return successResponse(res, {
    message: 'Authorized: Admin access granted',
    data: { role: req.user.role, user: req.user.email }
  });
});

// Test route strictly for FACULTY role
router.get('/faculty-only', authenticate, authorize('FACULTY'), (req, res) => {
  return successResponse(res, {
    message: 'Authorized: Faculty access granted',
    data: { role: req.user.role, user: req.user.email }
  });
});

// Test route strictly for STUDENT role
router.get('/student-only', authenticate, authorize('STUDENT'), (req, res) => {
  return successResponse(res, {
    message: 'Authorized: Student access granted',
    data: { role: req.user.role, user: req.user.email }
  });
});

export default router;
