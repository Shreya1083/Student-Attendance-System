import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import * as facultyController from '../controllers/facultyController.js';

const router = Router();

// Protect all faculty routes: must be logged in with role 'FACULTY'
router.use(authenticate, authorize('FACULTY'));

// GET /api/v1/faculty/my-subjects
router.get('/my-subjects', facultyController.getMySubjects);

export default router;
