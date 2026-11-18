import { successResponse, errorResponse } from '../utils/apiResponse.js';
import * as attendanceService from '../services/attendanceService.js';

// ─── Helper: maps service errors to HTTP responses ───────────────────────
const handleError = (res, err) => {
  const statusCode = err.statusCode || 500;
  return errorResponse(res, { statusCode, message: err.message });
};

// ─── GET /api/v1/attendance/assignment/:assignmentId/students ─────────────
/**
 * Returns enrolled students + assignment details for the marking UI.
 * Faculty-only: validated against their actual assignment.
 */
export const getEnrolledStudents = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const result = await attendanceService.getEnrolledStudents(assignmentId, req.user._id);

    return successResponse(res, {
      message: 'Enrolled students fetched successfully',
      data: result
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─── POST /api/v1/attendance/sessions ────────────────────────────────────
/**
 * Create a new session and persist all attendance records atomically.
 * Body is already validated by Zod middleware.
 */
export const createSession = async (req, res) => {
  try {
    const session = await attendanceService.createSession(req.body, req.user._id);

    return successResponse(res, {
      statusCode: 201,
      message: 'Attendance session created successfully',
      data: session
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─── GET /api/v1/attendance/sessions ─────────────────────────────────────
/**
 * List sessions belonging to the authenticated faculty.
 * Supports filters: assignmentId, subjectId, section, dateFrom, dateTo.
 */
export const listSessions = async (req, res) => {
  try {
    const result = await attendanceService.listSessions(req.query, req.user._id);

    return successResponse(res, {
      message: 'Sessions fetched successfully',
      data: result.sessions,
      meta: result.pagination
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─── GET /api/v1/attendance/sessions/:id ─────────────────────────────────
/**
 * Fetch a session and all its student records.
 */
export const getSessionById = async (req, res) => {
  try {
    const result = await attendanceService.getSessionById(req.params.id, req.user._id);

    return successResponse(res, {
      message: 'Session details fetched successfully',
      data: result
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─── PUT /api/v1/attendance/records/:id ──────────────────────────────────
/**
 * Edit a single student's status in an existing session.
 * Appends an audit-history entry automatically.
 */
export const updateRecord = async (req, res) => {
  try {
    const record = await attendanceService.updateRecord(
      req.params.id,
      req.body,
      req.user._id
    );

    return successResponse(res, {
      message: 'Attendance record updated successfully',
      data: record
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─── DELETE /api/v1/attendance/sessions/:id ───────────────────────────────
/**
 * Delete a session and cascade-delete all its attendance records.
 */
export const deleteSession = async (req, res) => {
  try {
    const result = await attendanceService.deleteSession(req.params.id, req.user._id);

    return successResponse(res, {
      message: result.message,
      data: null
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─── GET /api/v1/attendance/assignment/:assignmentId/report ───────────────
/**
 * Get comprehensive attendance report and defaulters for an assignment.
 */
export const getAssignmentReport = async (req, res) => {
  try {
    const report = await attendanceService.getAssignmentReport(
      req.params.assignmentId,
      req.user._id,
      req.user.role
    );

    return successResponse(res, {
      message: 'Assignment attendance report generated successfully',
      data: report
    });
  } catch (err) {
    return handleError(res, err);
  }
};
