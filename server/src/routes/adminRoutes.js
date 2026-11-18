import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { validate } from '../validators/index.js';
import * as adminController from '../controllers/adminController.js';
import {
  departmentSchema,
  semesterSchema,
  sectionSchema,
  subjectSchema,
  studentSchema,
  bulkStudentSchema,
  facultySchema,
  assignmentSchema
} from '../validators/adminValidator.js';

const router = Router();

// Protect ALL admin routes with authenticate and authorize('ADMIN')
router.use(authenticate, authorize('ADMIN'));

// ==========================================
// Dashboard Stats
// ==========================================
router.get('/stats', adminController.getStats);

// ==========================================
// Departments
// ==========================================
router.get('/departments', adminController.getDepartments);
router.post('/departments', validate(departmentSchema), adminController.createDepartment);
router.get('/departments/:id', adminController.getDepartmentById);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

// ==========================================
// Semesters
// ==========================================
router.get('/semesters', adminController.getSemesters);
router.post('/semesters', validate(semesterSchema), adminController.createSemester);
router.put('/semesters/:id', adminController.updateSemester);
router.delete('/semesters/:id', adminController.deleteSemester);

// ==========================================
// Sections
// ==========================================
router.get('/sections', adminController.getSections);
router.post('/sections', validate(sectionSchema), adminController.createSection);
router.put('/sections/:id', adminController.updateSection);
router.delete('/sections/:id', adminController.deleteSection);

// ==========================================
// Subjects
// ==========================================
router.get('/subjects', adminController.getSubjects);
router.post('/subjects', validate(subjectSchema), adminController.createSubject);
router.get('/subjects/:id', adminController.getSubjectById);
router.put('/subjects/:id', adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);

// ==========================================
// Students
// ==========================================
router.get('/students', adminController.getStudents);
router.post('/students', validate(studentSchema), adminController.createStudent);
router.post('/students/bulk', validate(bulkStudentSchema), adminController.bulkCreateStudents);
router.get('/students/:id', adminController.getStudentById);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// ==========================================
// Faculty
// ==========================================
router.get('/faculty', adminController.getFaculty);
router.post('/faculty', validate(facultySchema), adminController.createFaculty);
router.get('/faculty/:id', adminController.getFacultyById);
router.put('/faculty/:id', adminController.updateFaculty);
router.delete('/faculty/:id', adminController.deleteFaculty);

// ==========================================
// Faculty Assignments
// ==========================================
router.get('/assignments', adminController.getAssignments);
router.post('/assignments', validate(assignmentSchema), adminController.createAssignment);
router.delete('/assignments/:id', adminController.deleteAssignment);

// ==========================================
// Settings
// ==========================================
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// ==========================================
// Attendance Reports
// ==========================================
router.get('/attendance/summary', adminController.getAttendanceSummary);

export default router;
