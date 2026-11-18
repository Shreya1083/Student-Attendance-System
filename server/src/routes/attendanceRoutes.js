import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { validate } from '../validators/index.js';
import {
  createSessionSchema,
  updateRecordSchema
} from '../validators/attendanceValidator.js';
import * as attendanceController from '../controllers/attendanceController.js';

const router = Router();

// All attendance routes require a valid FACULTY JWT
router.use(authenticate, authorize('FACULTY'));

// ─── Enrolled Students (pre-flight for marking UI) ───────────────────────
// GET /api/v1/attendance/assignment/:assignmentId/students
router.get(
  '/assignment/:assignmentId/students',
  attendanceController.getEnrolledStudents
);

// ─── Sessions ────────────────────────────────────────────────────────────
// POST /api/v1/attendance/sessions
router.post(
  '/sessions',
  validate(createSessionSchema),
  attendanceController.createSession
);

// GET /api/v1/attendance/sessions
router.get('/sessions', attendanceController.listSessions);

// GET /api/v1/attendance/sessions/:id
router.get('/sessions/:id', attendanceController.getSessionById);

// DELETE /api/v1/attendance/sessions/:id
router.delete('/sessions/:id', attendanceController.deleteSession);

// ─── Individual Records ───────────────────────────────────────────────────
// PUT /api/v1/attendance/records/:id
router.put(
  '/records/:id',
  validate(updateRecordSchema),
  attendanceController.updateRecord
);

export default router;
