import { getSystemHealth } from '../services/healthService.js';
import { successResponse } from '../utils/apiResponse.js';

export const checkHealth = (req, res, next) => {
  try {
    const healthData = getSystemHealth();
    return successResponse(res, {
      statusCode: 200,
      message: 'Student Attendance & Notification API is operational',
      data: healthData
    });
  } catch (error) {
    next(error);
  }
};
