import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Department from '../models/Department.js';
import Semester from '../models/Semester.js';
import Section from '../models/Section.js';
import Subject from '../models/Subject.js';
import FacultyAssignment from '../models/FacultyAssignment.js';
import SystemSetting from '../models/SystemSetting.js';

// ==========================================
// 1. DASHBOARD OVERVIEW & STATS
// ==========================================
export const getAdminStats = async () => {
  const [
    totalStudents,
    totalFaculty,
    totalDepartments,
    totalSubjects,
    totalAssignments
  ] = await Promise.all([
    Student.countDocuments(),
    Faculty.countDocuments(),
    Department.countDocuments(),
    Subject.countDocuments(),
    FacultyAssignment.countDocuments()
  ]);

  const recentStudents = await Student.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'name email createdAt');

  const recentAssignments = await FacultyAssignment.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({
      path: 'facultyId',
      populate: { path: 'userId', select: 'name email' }
    })
    .populate('subjectId', 'subjectCode name');

  return {
    counts: {
      totalStudents,
      totalFaculty,
      totalDepartments,
      totalSubjects,
      totalAssignments
    },
    recentActivities: {
      recentStudents,
      recentAssignments
    }
  };
};

// ==========================================
// 2. DEPARTMENT MANAGEMENT
// ==========================================
export const listDepartments = async (query = {}) => {
  const filter = {};
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }
  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { departmentName: { $regex: s, $options: 'i' } },
      { departmentCode: { $regex: s, $options: 'i' } }
    ];
  }

  return Department.find(filter).sort({ departmentCode: 1 });
};

export const createDepartment = async (data) => {
  const existing = await Department.findOne({ departmentCode: data.departmentCode });
  if (existing) {
    const err = new Error(`Department with code '${data.departmentCode}' already exists`);
    err.statusCode = 409;
    throw err;
  }

  return Department.create(data);
};

export const getDepartmentById = async (id) => {
  const dept = await Department.findById(id);
  if (!dept) {
    const err = new Error('Department not found');
    err.statusCode = 404;
    throw err;
  }
  return dept;
};

export const updateDepartment = async (id, data) => {
  if (data.departmentCode) {
    const conflict = await Department.findOne({
      departmentCode: data.departmentCode,
      _id: { $ne: id }
    });
    if (conflict) {
      const err = new Error(`Department code '${data.departmentCode}' is already in use`);
      err.statusCode = 409;
      throw err;
    }
  }

  const updated = await Department.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updated) {
    const err = new Error('Department not found');
    err.statusCode = 404;
    throw err;
  }
  return updated;
};

export const deleteDepartment = async (id) => {
  const dept = await Department.findById(id);
  if (!dept) {
    const err = new Error('Department not found');
    err.statusCode = 404;
    throw err;
  }

  // Check if linked subjects, faculty, or students exist
  const [linkedStudents, linkedFaculty, linkedSubjects] = await Promise.all([
    Student.countDocuments({ department: dept.departmentCode }),
    Faculty.countDocuments({ department: dept.departmentCode }),
    Subject.countDocuments({ department: dept.departmentCode })
  ]);

  if (linkedStudents > 0 || linkedFaculty > 0 || linkedSubjects > 0) {
    const err = new Error(
      `Cannot delete department '${dept.departmentCode}'. Linked academic records exist (${linkedStudents} students, ${linkedFaculty} faculty, ${linkedSubjects} subjects). Please deactivate instead.`
    );
    err.statusCode = 400;
    throw err;
  }

  await Department.findByIdAndDelete(id);
  return { message: `Department '${dept.departmentCode}' deleted successfully` };
};

// ==========================================
// 3. SEMESTER MANAGEMENT
// ==========================================
export const listSemesters = async (query = {}) => {
  const filter = {};
  if (query.department) {
    filter.department = query.department.toUpperCase();
  }
  if (query.academicYear) {
    filter.academicYear = query.academicYear;
  }

  return Semester.find(filter).sort({ department: 1, semesterNumber: 1 });
};

export const createSemester = async (data) => {
  const existing = await Semester.findOne({
    department: data.department,
    semesterNumber: data.semesterNumber,
    academicYear: data.academicYear
  });

  if (existing) {
    const err = new Error(
      `Semester ${data.semesterNumber} for department '${data.department}' (${data.academicYear}) already exists`
    );
    err.statusCode = 409;
    throw err;
  }

  return Semester.create(data);
};

export const updateSemester = async (id, data) => {
  const updated = await Semester.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updated) {
    const err = new Error('Semester not found');
    err.statusCode = 404;
    throw err;
  }
  return updated;
};

export const deleteSemester = async (id) => {
  const sem = await Semester.findById(id);
  if (!sem) {
    const err = new Error('Semester not found');
    err.statusCode = 404;
    throw err;
  }

  // Check linked subjects or students
  const linkedSubjects = await Subject.countDocuments({
    department: sem.department,
    semester: sem.semesterNumber
  });

  if (linkedSubjects > 0) {
    const err = new Error(`Cannot delete semester. ${linkedSubjects} subject(s) are linked to it.`);
    err.statusCode = 400;
    throw err;
  }

  await Semester.findByIdAndDelete(id);
  return { message: 'Semester deleted successfully' };
};

// ==========================================
// 4. SECTION MANAGEMENT
// ==========================================
export const listSections = async (query = {}) => {
  const filter = {};
  if (query.department) filter.department = query.department.toUpperCase();
  if (query.semester) filter.semester = Number(query.semester);
  if (query.academicYear) filter.academicYear = query.academicYear;

  return Section.find(filter).sort({ department: 1, semester: 1, sectionName: 1 });
};

export const createSection = async (data) => {
  const existing = await Section.findOne({
    department: data.department,
    semester: data.semester,
    sectionName: data.sectionName,
    academicYear: data.academicYear
  });

  if (existing) {
    const err = new Error(
      `Section '${data.sectionName}' for ${data.department} Sem ${data.semester} (${data.academicYear}) already exists`
    );
    err.statusCode = 409;
    throw err;
  }

  return Section.create(data);
};

export const updateSection = async (id, data) => {
  const updated = await Section.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updated) {
    const err = new Error('Section not found');
    err.statusCode = 404;
    throw err;
  }
  return updated;
};

export const deleteSection = async (id) => {
  const section = await Section.findById(id);
  if (!section) {
    const err = new Error('Section not found');
    err.statusCode = 404;
    throw err;
  }

  const linkedStudents = await Student.countDocuments({
    department: section.department,
    semester: section.semester,
    section: section.sectionName
  });

  if (linkedStudents > 0) {
    const err = new Error(`Cannot delete section. ${linkedStudents} student(s) are enrolled in it.`);
    err.statusCode = 400;
    throw err;
  }

  await Section.findByIdAndDelete(id);
  return { message: 'Section deleted successfully' };
};

// ==========================================
// 5. SUBJECT MANAGEMENT
// ==========================================
export const listSubjects = async (query = {}) => {
  const filter = {};
  if (query.department) filter.department = query.department.toUpperCase();
  if (query.semester) filter.semester = Number(query.semester);
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { subjectCode: { $regex: s, $options: 'i' } },
      { name: { $regex: s, $options: 'i' } }
    ];
  }

  return Subject.find(filter).sort({ department: 1, semester: 1, subjectCode: 1 });
};

export const createSubject = async (data) => {
  const existing = await Subject.findOne({ subjectCode: data.subjectCode });
  if (existing) {
    const err = new Error(`Subject with code '${data.subjectCode}' already exists`);
    err.statusCode = 409;
    throw err;
  }

  return Subject.create(data);
};

export const getSubjectById = async (id) => {
  const subject = await Subject.findById(id);
  if (!subject) {
    const err = new Error('Subject not found');
    err.statusCode = 404;
    throw err;
  }
  return subject;
};

export const updateSubject = async (id, data) => {
  if (data.subjectCode) {
    const conflict = await Subject.findOne({
      subjectCode: data.subjectCode,
      _id: { $ne: id }
    });
    if (conflict) {
      const err = new Error(`Subject code '${data.subjectCode}' is already in use`);
      err.statusCode = 409;
      throw err;
    }
  }

  const updated = await Subject.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updated) {
    const err = new Error('Subject not found');
    err.statusCode = 404;
    throw err;
  }
  return updated;
};

export const deleteSubject = async (id) => {
  const subject = await Subject.findById(id);
  if (!subject) {
    const err = new Error('Subject not found');
    err.statusCode = 404;
    throw err;
  }

  // Prevent deletion if faculty assignments reference it
  const linkedAssignments = await FacultyAssignment.countDocuments({ subjectId: id });
  if (linkedAssignments > 0) {
    const err = new Error(
      `Cannot delete subject '${subject.subjectCode}'. It is referenced in ${linkedAssignments} faculty assignment(s). Please deactivate instead.`
    );
    err.statusCode = 400;
    throw err;
  }

  await Subject.findByIdAndDelete(id);
  return { message: `Subject '${subject.subjectCode}' deleted successfully` };
};

// ==========================================
// 6. STUDENT MANAGEMENT
// ==========================================
export const listStudents = async (query = {}) => {
  const filter = {};
  if (query.department) filter.department = query.department.toUpperCase();
  if (query.semester) filter.semester = Number(query.semester);
  if (query.section) filter.section = query.section.toUpperCase();
  if (query.academicYear) filter.academicYear = query.academicYear;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  let studentQuery = Student.find(filter).populate('userId', 'name email isActive lastLogin');

  if (query.search) {
    const s = query.search.trim();
    // Search by rollNumber or populate and filter by user name
    const matchingUsers = await User.find({
      name: { $regex: s, $options: 'i' },
      role: 'STUDENT'
    }).select('_id');

    const userIds = matchingUsers.map((u) => u._id);

    filter.$or = [
      { rollNumber: { $regex: s, $options: 'i' } },
      { userId: { $in: userIds } }
    ];
    studentQuery = Student.find(filter).populate('userId', 'name email isActive lastLogin');
  }

  return studentQuery.sort({ department: 1, semester: 1, section: 1, rollNumber: 1 });
};

export const createStudent = async (data) => {
  // Check duplicate email in User
  const existingEmail = await User.findOne({ email: data.email });
  if (existingEmail) {
    const err = new Error(`User with email '${data.email}' already exists`);
    err.statusCode = 409;
    throw err;
  }

  // Check duplicate rollNumber in Student
  const existingRoll = await Student.findOne({ rollNumber: data.rollNumber });
  if (existingRoll) {
    const err = new Error(`Student with roll number '${data.rollNumber}' already exists`);
    err.statusCode = 409;
    throw err;
  }

  // 1. Create base User account with role 'STUDENT'
  let createdUser;
  try {
    createdUser = await User.create({
      name: data.name,
      email: data.email,
      password: data.password || 'Student@123', // Default secure initial password if omitted
      role: 'STUDENT',
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  } catch (userErr) {
    throw userErr;
  }

  // 2. Create Student profile referencing the User
  try {
    const student = await Student.create({
      userId: createdUser._id,
      rollNumber: data.rollNumber,
      department: data.department,
      semester: data.semester,
      section: data.section,
      academicYear: data.academicYear,
      isActive: createdUser.isActive
    });

    return await student.populate('userId', 'name email role isActive');
  } catch (studentErr) {
    // Rollback created User account if Student profile creation fails
    await User.findByIdAndDelete(createdUser._id);
    throw studentErr;
  }
};

export const getStudentById = async (id) => {
  const student = await Student.findById(id).populate('userId', 'name email role isActive lastLogin createdAt');
  if (!student) {
    const err = new Error('Student profile not found');
    err.statusCode = 404;
    throw err;
  }
  return student;
};

export const updateStudent = async (id, data) => {
  const student = await Student.findById(id);
  if (!student) {
    const err = new Error('Student profile not found');
    err.statusCode = 404;
    throw err;
  }

  // Check roll number uniqueness if changed
  if (data.rollNumber && data.rollNumber !== student.rollNumber) {
    const conflict = await Student.findOne({ rollNumber: data.rollNumber, _id: { $ne: id } });
    if (conflict) {
      const err = new Error(`Roll number '${data.rollNumber}' is already registered`);
      err.statusCode = 409;
      throw err;
    }
    student.rollNumber = data.rollNumber;
  }

  // Update student fields
  if (data.department) student.department = data.department;
  if (data.semester) student.semester = data.semester;
  if (data.section) student.section = data.section;
  if (data.academicYear) student.academicYear = data.academicYear;
  if (data.isActive !== undefined) student.isActive = data.isActive;

  // Update associated User name or email if provided
  if (data.name || data.email || data.isActive !== undefined) {
    const userUpdate = {};
    if (data.name) userUpdate.name = data.name;
    if (data.isActive !== undefined) userUpdate.isActive = data.isActive;
    if (data.email) {
      const emailConflict = await User.findOne({ email: data.email, _id: { $ne: student.userId } });
      if (emailConflict) {
        const err = new Error(`Email '${data.email}' is already in use`);
        err.statusCode = 409;
        throw err;
      }
      userUpdate.email = data.email;
    }

    await User.findByIdAndUpdate(student.userId, userUpdate);
  }

  await student.save();
  return student.populate('userId', 'name email role isActive');
};

export const deactivateStudent = async (id) => {
  const student = await Student.findById(id);
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }

  // Safe deactivation
  student.isActive = false;
  await student.save();
  await User.findByIdAndUpdate(student.userId, { isActive: false });

  return { message: `Student '${student.rollNumber}' deactivated successfully` };
};

export const bulkCreateStudents = async (studentList) => {
  const results = {
    total: studentList.length,
    successCount: 0,
    failureCount: 0,
    created: [],
    errors: []
  };

  for (const item of studentList) {
    try {
      const created = await createStudent(item);
      results.successCount++;
      results.created.push({
        rollNumber: created.rollNumber,
        name: created.userId?.name,
        email: created.userId?.email
      });
    } catch (err) {
      results.failureCount++;
      results.errors.push({
        rollNumber: item.rollNumber,
        email: item.email,
        error: err.message
      });
    }
  }

  return results;
};

// ==========================================
// 7. FACULTY MANAGEMENT
// ==========================================
export const listFaculty = async (query = {}) => {
  const filter = {};
  if (query.department) filter.department = query.department.toUpperCase();
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  let facultyQuery = Faculty.find(filter).populate('userId', 'name email isActive lastLogin');

  if (query.search) {
    const s = query.search.trim();
    const matchingUsers = await User.find({
      name: { $regex: s, $options: 'i' },
      role: 'FACULTY'
    }).select('_id');

    const userIds = matchingUsers.map((u) => u._id);

    filter.$or = [
      { facultyCode: { $regex: s, $options: 'i' } },
      { userId: { $in: userIds } }
    ];
    facultyQuery = Faculty.find(filter).populate('userId', 'name email isActive lastLogin');
  }

  return facultyQuery.sort({ department: 1, facultyCode: 1 });
};

export const createFaculty = async (data) => {
  const existingEmail = await User.findOne({ email: data.email });
  if (existingEmail) {
    const err = new Error(`User with email '${data.email}' already exists`);
    err.statusCode = 409;
    throw err;
  }

  const existingCode = await Faculty.findOne({ facultyCode: data.facultyCode });
  if (existingCode) {
    const err = new Error(`Faculty with code '${data.facultyCode}' already exists`);
    err.statusCode = 409;
    throw err;
  }

  // 1. Create base User account with role 'FACULTY'
  let createdUser;
  try {
    createdUser = await User.create({
      name: data.name,
      email: data.email,
      password: data.password || 'Faculty@123',
      role: 'FACULTY',
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  } catch (userErr) {
    throw userErr;
  }

  // 2. Create Faculty profile
  try {
    const faculty = await Faculty.create({
      userId: createdUser._id,
      facultyCode: data.facultyCode,
      department: data.department,
      designation: data.designation || 'Assistant Professor',
      isActive: createdUser.isActive
    });

    return await faculty.populate('userId', 'name email role isActive');
  } catch (facErr) {
    await User.findByIdAndDelete(createdUser._id);
    throw facErr;
  }
};

export const getFacultyById = async (id) => {
  const faculty = await Faculty.findById(id).populate('userId', 'name email role isActive lastLogin createdAt');
  if (!faculty) {
    const err = new Error('Faculty profile not found');
    err.statusCode = 404;
    throw err;
  }
  return faculty;
};

export const updateFaculty = async (id, data) => {
  const faculty = await Faculty.findById(id);
  if (!faculty) {
    const err = new Error('Faculty profile not found');
    err.statusCode = 404;
    throw err;
  }

  if (data.facultyCode && data.facultyCode !== faculty.facultyCode) {
    const conflict = await Faculty.findOne({ facultyCode: data.facultyCode, _id: { $ne: id } });
    if (conflict) {
      const err = new Error(`Faculty code '${data.facultyCode}' is already registered`);
      err.statusCode = 409;
      throw err;
    }
    faculty.facultyCode = data.facultyCode;
  }

  if (data.department) faculty.department = data.department;
  if (data.designation) faculty.designation = data.designation;
  if (data.isActive !== undefined) faculty.isActive = data.isActive;

  if (data.name || data.email || data.isActive !== undefined) {
    const userUpdate = {};
    if (data.name) userUpdate.name = data.name;
    if (data.isActive !== undefined) userUpdate.isActive = data.isActive;
    if (data.email) {
      const emailConflict = await User.findOne({ email: data.email, _id: { $ne: faculty.userId } });
      if (emailConflict) {
        const err = new Error(`Email '${data.email}' is already in use`);
        err.statusCode = 409;
        throw err;
      }
      userUpdate.email = data.email;
    }

    await User.findByIdAndUpdate(faculty.userId, userUpdate);
  }

  await faculty.save();
  return faculty.populate('userId', 'name email role isActive');
};

export const deactivateFaculty = async (id) => {
  const faculty = await Faculty.findById(id);
  if (!faculty) {
    const err = new Error('Faculty not found');
    err.statusCode = 404;
    throw err;
  }

  faculty.isActive = false;
  await faculty.save();
  await User.findByIdAndUpdate(faculty.userId, { isActive: false });

  return { message: `Faculty '${faculty.facultyCode}' deactivated successfully` };
};

// ==========================================
// 8. FACULTY-TO-SUBJECT ASSIGNMENT
// ==========================================
export const listAssignments = async (query = {}) => {
  const filter = {};
  if (query.facultyId) filter.facultyId = query.facultyId;
  if (query.subjectId) filter.subjectId = query.subjectId;
  if (query.department) filter.department = query.department.toUpperCase();
  if (query.semester) filter.semester = Number(query.semester);
  if (query.section) filter.section = query.section.toUpperCase();
  if (query.academicYear) filter.academicYear = query.academicYear;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  return FacultyAssignment.find(filter)
    .populate({
      path: 'facultyId',
      populate: { path: 'userId', select: 'name email' }
    })
    .populate('subjectId', 'subjectCode name credits')
    .sort({ academicYear: -1, department: 1, semester: 1, section: 1 });
};

export const createAssignment = async (data) => {
  // 1. Verify Faculty exists & belongs to the department
  const faculty = await Faculty.findById(data.facultyId).populate('userId', 'name email');
  if (!faculty) {
    const err = new Error('Selected faculty not found');
    err.statusCode = 404;
    throw err;
  }
  if (faculty.department !== data.department) {
    const err = new Error(
      `Faculty '${faculty.facultyCode}' belongs to department '${faculty.department}', but assignment is for '${data.department}'`
    );
    err.statusCode = 400;
    throw err;
  }

  // 2. Verify Subject exists & belongs to department and semester
  const subject = await Subject.findById(data.subjectId);
  if (!subject) {
    const err = new Error('Selected subject not found');
    err.statusCode = 404;
    throw err;
  }
  if (subject.department !== data.department || subject.semester !== data.semester) {
    const err = new Error(
      `Subject '${subject.subjectCode}' belongs to '${subject.department}' Semester ${subject.semester}, but assignment is for '${data.department}' Semester ${data.semester}`
    );
    err.statusCode = 400;
    throw err;
  }

  // 3. Check duplicate assignment
  const existing = await FacultyAssignment.findOne({
    facultyId: data.facultyId,
    subjectId: data.subjectId,
    academicYear: data.academicYear,
    semester: data.semester,
    section: data.section
  });

  if (existing) {
    const err = new Error(
      `This faculty is already assigned to subject '${subject.subjectCode}' for section ${data.section} (${data.academicYear})`
    );
    err.statusCode = 409;
    throw err;
  }

  const assignment = await FacultyAssignment.create(data);
  return assignment.populate([
    {
      path: 'facultyId',
      populate: { path: 'userId', select: 'name email' }
    },
    { path: 'subjectId', select: 'subjectCode name credits' }
  ]);
};

export const deleteAssignment = async (id) => {
  const assignment = await FacultyAssignment.findById(id);
  if (!assignment) {
    const err = new Error('Faculty assignment not found');
    err.statusCode = 404;
    throw err;
  }

  await FacultyAssignment.findByIdAndDelete(id);
  return { message: 'Faculty assignment removed successfully' };
};

// ==========================================
// 9. SYSTEM SETTINGS
// ==========================================
export const getSetting = async (key = 'LOW_ATTENDANCE_THRESHOLD') => {
  let setting = await SystemSetting.findOne({ key });
  if (!setting) {
    setting = await SystemSetting.create({
      key,
      value: 75,
      description: 'Default minimum attendance percentage threshold before triggering alerts'
    });
  }
  return setting;
};

export const updateSetting = async (key, value, userId) => {
  const setting = await SystemSetting.findOneAndUpdate(
    { key },
    { value, updatedBy: userId, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  return setting;
};
