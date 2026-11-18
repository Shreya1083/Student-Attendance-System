import * as studentService from '../services/studentService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await studentService.getProfile(req.user._id);
    return successResponse(res, {
      statusCode: 200,
      message: 'Student profile retrieved successfully',
      data: profile
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    }
    next(err);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const attendance = await studentService.getMyAttendance(req.user._id);
    return successResponse(res, {
      statusCode: 200,
      message: 'Student attendance records retrieved successfully',
      data: attendance
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    }
    next(err);
  }
};

export const getSubjectHistory = async (req, res, next) => {
  try {
    const history = await studentService.getSubjectHistory(req.user._id, req.params.subjectId);
    return successResponse(res, {
      statusCode: 200,
      message: 'Subject session attendance history retrieved successfully',
      data: history
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    }
    next(err);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await studentService.getNotifications(req.user._id);
    return successResponse(res, {
      statusCode: 200,
      message: 'Student notifications retrieved successfully',
      data: notifications
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    }
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await studentService.markNotificationRead(req.user._id, req.params.id);
    return successResponse(res, {
      statusCode: 200,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    }
    next(err);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const result = await studentService.markAllNotificationsRead(req.user._id);
    return successResponse(res, {
      statusCode: 200,
      message: result.message
    });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    }
    next(err);
  }
};
