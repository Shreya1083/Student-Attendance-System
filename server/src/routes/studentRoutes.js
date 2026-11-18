import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import * as studentController from '../controllers/studentController.js';

const router = Router();

// Protect all student routes: require authenticated user with role STUDENT
router.use(authenticate, authorize('STUDENT'));

// Student Profile
router.get('/profile', studentController.getProfile);

// Subject-wise attendance calculation & summary
router.get('/my-attendance', studentController.getMyAttendance);

// Detailed date-wise attendance history for a single subject
router.get('/my-attendance/:subjectId', studentController.getSubjectHistory);

// Notifications
router.get('/notifications', studentController.getNotifications);
router.put('/notifications/:id/read', studentController.markNotificationRead);
router.put('/notifications/read-all', studentController.markAllNotificationsRead);

export default router;
