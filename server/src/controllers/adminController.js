import * as adminService from '../services/adminService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Stats
export const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getAdminStats();
    return successResponse(res, { message: 'Admin dashboard statistics retrieved', data: stats });
  } catch (err) {
    next(err);
  }
};

// Departments
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await adminService.listDepartments(req.query);
    return successResponse(res, { message: 'Departments retrieved', data: departments });
  } catch (err) {
    next(err);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const dept = await adminService.createDepartment(req.body);
    return successResponse(res, { statusCode: 201, message: 'Department created successfully', data: dept });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const dept = await adminService.getDepartmentById(req.params.id);
    return successResponse(res, { message: 'Department details retrieved', data: dept });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const dept = await adminService.updateDepartment(req.params.id, req.body);
    return successResponse(res, { message: 'Department updated successfully', data: dept });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const result = await adminService.deleteDepartment(req.params.id);
    return successResponse(res, { message: result.message });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

// Semesters
export const getSemesters = async (req, res, next) => {
  try {
    const semesters = await adminService.listSemesters(req.query);
    return successResponse(res, { message: 'Semesters retrieved', data: semesters });
  } catch (err) {
    next(err);
  }
};

export const createSemester = async (req, res, next) => {
  try {
    const sem = await adminService.createSemester(req.body);
    return successResponse(res, { statusCode: 201, message: 'Semester created successfully', data: sem });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const updateSemester = async (req, res, next) => {
  try {
    const sem = await adminService.updateSemester(req.params.id, req.body);
    return successResponse(res, { message: 'Semester updated successfully', data: sem });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const deleteSemester = async (req, res, next) => {
  try {
    const result = await adminService.deleteSemester(req.params.id);
    return successResponse(res, { message: result.message });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

// Sections
export const getSections = async (req, res, next) => {
  try {
    const sections = await adminService.listSections(req.query);
    return successResponse(res, { message: 'Sections retrieved', data: sections });
  } catch (err) {
    next(err);
  }
};

export const createSection = async (req, res, next) => {
  try {
    const section = await adminService.createSection(req.body);
    return successResponse(res, { statusCode: 201, message: 'Section created successfully', data: section });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const updateSection = async (req, res, next) => {
  try {
    const section = await adminService.updateSection(req.params.id, req.body);
    return successResponse(res, { message: 'Section updated successfully', data: section });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const deleteSection = async (req, res, next) => {
  try {
    const result = await adminService.deleteSection(req.params.id);
    return successResponse(res, { message: result.message });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

// Subjects
export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await adminService.listSubjects(req.query);
    return successResponse(res, { message: 'Subjects retrieved', data: subjects });
  } catch (err) {
    next(err);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const subject = await adminService.createSubject(req.body);
    return successResponse(res, { statusCode: 201, message: 'Subject created successfully', data: subject });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const getSubjectById = async (req, res, next) => {
  try {
    const subject = await adminService.getSubjectById(req.params.id);
    return successResponse(res, { message: 'Subject details retrieved', data: subject });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await adminService.updateSubject(req.params.id, req.body);
    return successResponse(res, { message: 'Subject updated successfully', data: subject });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const result = await adminService.deleteSubject(req.params.id);
    return successResponse(res, { message: result.message });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

// Students
export const getStudents = async (req, res, next) => {
  try {
    const students = await adminService.listStudents(req.query);
    return successResponse(res, { message: 'Students retrieved', data: students });
  } catch (err) {
    next(err);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const student = await adminService.createStudent(req.body);
    return successResponse(res, { statusCode: 201, message: 'Student created successfully', data: student });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const student = await adminService.getStudentById(req.params.id);
    return successResponse(res, { message: 'Student details retrieved', data: student });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const student = await adminService.updateStudent(req.params.id, req.body);
    return successResponse(res, { message: 'Student updated successfully', data: student });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const result = await adminService.deactivateStudent(req.params.id);
    return successResponse(res, { message: result.message });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const bulkCreateStudents = async (req, res, next) => {
  try {
    const results = await adminService.bulkCreateStudents(req.body.students);
    return successResponse(res, {
      statusCode: 201,
      message: `Bulk student import completed. Created: ${results.successCount}, Failed: ${results.failureCount}`,
      data: results
    });
  } catch (err) {
    next(err);
  }
};

// Faculty
export const getFaculty = async (req, res, next) => {
  try {
    const faculty = await adminService.listFaculty(req.query);
    return successResponse(res, { message: 'Faculty members retrieved', data: faculty });
  } catch (err) {
    next(err);
  }
};

export const createFaculty = async (req, res, next) => {
  try {
    const faculty = await adminService.createFaculty(req.body);
    return successResponse(res, { statusCode: 201, message: 'Faculty created successfully', data: faculty });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await adminService.getFacultyById(req.params.id);
    return successResponse(res, { message: 'Faculty details retrieved', data: faculty });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const updateFaculty = async (req, res, next) => {
  try {
    const faculty = await adminService.updateFaculty(req.params.id, req.body);
    return successResponse(res, { message: 'Faculty updated successfully', data: faculty });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const deleteFaculty = async (req, res, next) => {
  try {
    const result = await adminService.deactivateFaculty(req.params.id);
    return successResponse(res, { message: result.message });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

// Assignments
export const getAssignments = async (req, res, next) => {
  try {
    const assignments = await adminService.listAssignments(req.query);
    return successResponse(res, { message: 'Faculty assignments retrieved', data: assignments });
  } catch (err) {
    next(err);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    const assignment = await adminService.createAssignment(req.body);
    return successResponse(res, { statusCode: 201, message: 'Faculty assigned to subject successfully', data: assignment });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    const result = await adminService.deleteAssignment(req.params.id);
    return successResponse(res, { message: result.message });
  } catch (err) {
    if (err.statusCode) return errorResponse(res, { statusCode: err.statusCode, message: err.message });
    next(err);
  }
};

// Settings
export const getSettings = async (req, res, next) => {
  try {
    const setting = await adminService.getSetting(req.query.key || 'LOW_ATTENDANCE_THRESHOLD');
    return successResponse(res, { message: 'Setting retrieved', data: setting });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    const setting = await adminService.updateSetting(key || 'LOW_ATTENDANCE_THRESHOLD', value, req.user._id);
    return successResponse(res, { message: 'Setting updated successfully', data: setting });
  } catch (err) {
    next(err);
  }
};

export const getAttendanceSummary = async (req, res, next) => {
  try {
    const { getAdminAttendanceSummary } = await import('../services/attendanceService.js');
    const summary = await getAdminAttendanceSummary(req.query);
    return successResponse(res, {
      message: 'Institutional attendance summary retrieved successfully',
      data: summary
    });
  } catch (err) {
    next(err);
  }
};
