import Faculty from '../models/Faculty.js';
import FacultyAssignment from '../models/FacultyAssignment.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * GET /api/v1/faculty/my-subjects
 * Resolves the authenticated user's faculty profile and returns their assigned subjects and sections
 */
export const getMySubjects = async (req, res, next) => {
  try {
    // 1. Resolve Faculty identity strictly from authenticated user ID
    const faculty = await Faculty.findOne({ userId: req.user._id });

    if (!faculty) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'No associated faculty profile found for this user account'
      });
    }

    // 2. Query assignments for this faculty member
    const assignments = await FacultyAssignment.find({
      facultyId: faculty._id,
      isActive: true
    })
      .populate('subjectId', 'subjectCode name credits department semester isActive')
      .sort({ academicYear: -1, semester: 1, section: 1 });

    return successResponse(res, {
      message: 'Assigned subjects retrieved successfully',
      data: {
        faculty: {
          id: faculty._id,
          facultyCode: faculty.facultyCode,
          department: faculty.department,
          designation: faculty.designation
        },
        assignments
      }
    });
  } catch (err) {
    next(err);
  }
};
