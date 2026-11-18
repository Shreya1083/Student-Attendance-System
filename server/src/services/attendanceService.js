import mongoose from 'mongoose';
import Faculty from '../models/Faculty.js';
import FacultyAssignment from '../models/FacultyAssignment.js';
import Student from '../models/Student.js';
import AttendanceSession from '../models/AttendanceSession.js';
import AttendanceRecord from '../models/AttendanceRecord.js';

// ─── Helper ───────────────────────────────────────────────────────────────
const throwError = (msg, code = 400) => {
  const e = new Error(msg);
  e.statusCode = code;
  throw e;
};

/**
 * Resolve the Faculty profile that belongs to the authenticated User.
 * Throws 404 if the user has no linked faculty profile.
 */
const resolveFaculty = async (userId) => {
  const faculty = await Faculty.findOne({ userId });
  if (!faculty) throwError('No faculty profile found for the authenticated user.', 404);
  return faculty;
};

/**
 * Verify that the given faculty is authorised (has an active FacultyAssignment)
 * for the requested assignment. Returns the assignment document.
 */
const resolveAssignment = async (assignmentId, facultyId) => {
  const assignment = await FacultyAssignment.findById(assignmentId)
    .populate('subjectId', 'subjectCode name credits')
    .populate('facultyId', 'facultyCode department');

  if (!assignment) throwError('Faculty assignment not found.', 404);

  // Guard: only the assigned faculty can mark for this assignment
  if (assignment.facultyId._id.toString() !== facultyId.toString()) {
    throwError('You are not authorised to mark attendance for this assignment.', 403);
  }

  if (!assignment.isActive) {
    throwError('This faculty assignment is inactive. Contact admin to reactivate.', 403);
  }

  return assignment;
};

// ─── 1. Get enrolled students for an assignment ───────────────────────────
/**
 * Returns all active students enrolled in the assignment's dept/sem/section/year.
 * Used by the faculty marking UI to build the student list.
 */
export const getEnrolledStudents = async (assignmentId, userId) => {
  const faculty = await resolveFaculty(userId);
  const assignment = await resolveAssignment(assignmentId, faculty._id);

  const students = await Student.find({
    department: assignment.department,
    semester: assignment.semester,
    section: assignment.section,
    academicYear: assignment.academicYear,
    isActive: true
  })
    .populate('userId', 'name email')
    .sort({ rollNumber: 1 });

  return { assignment, students };
};

// ─── 2. Create Attendance Session + bulk-insert Records ──────────────────
/**
 * Atomically:
 *  1. Validates faculty authorisation
 *  2. Checks for duplicate session
 *  3. Creates AttendanceSession
 *  4. Bulk-inserts one AttendanceRecord per student
 *  5. Updates session aggregate counts
 */
export const createSession = async (data, userId) => {
  const { assignmentId, date, sessionSlot, topic, records } = data;

  // 1. Resolve faculty & assignment
  const faculty = await resolveFaculty(userId);
  const assignment = await resolveAssignment(assignmentId, faculty._id);

  // 2. Normalise date to midnight UTC for consistent duplicate checking
  const sessionDate = new Date(date);
  sessionDate.setUTCHours(0, 0, 0, 0);

  // 3. Duplicate session check
  const existingSession = await AttendanceSession.findOne({
    subjectId: assignment.subjectId._id,
    date: sessionDate,
    sessionSlot,
    academicYear: assignment.academicYear,
    semester: assignment.semester,
    section: assignment.section
  });

  if (existingSession) {
    throwError(
      `Attendance for ${assignment.subjectId.subjectCode} — Slot ${sessionSlot} on ${sessionDate.toISOString().slice(0, 10)} already exists. Use edit to modify individual records.`,
      409
    );
  }

  // 4. Verify every submitted studentId belongs to this section
  const enrolledStudents = await Student.find({
    department: assignment.department,
    semester: assignment.semester,
    section: assignment.section,
    academicYear: assignment.academicYear,
    isActive: true
  }).select('_id');

  const enrolledIds = new Set(enrolledStudents.map((s) => s._id.toString()));

  // Filter records to only include enrolled + active students
  const validRecords = records.filter((r) => enrolledIds.has(r.studentId));
  if (validRecords.length === 0) {
    throwError('None of the submitted student IDs match enrolled students in this section.', 400);
  }

  // 5. Create the session
  const session = await AttendanceSession.create({
    subjectId: assignment.subjectId._id,
    facultyId: faculty._id,
    assignmentId: assignment._id,
    createdBy: userId,
    department: assignment.department,
    semester: assignment.semester,
    section: assignment.section,
    academicYear: assignment.academicYear,
    date: sessionDate,
    sessionSlot,
    topic: topic || '',
    totalStudents: validRecords.length
  });

  // 6. Bulk-insert records
  const recordDocs = validRecords.map((r) => ({
    sessionId: session._id,
    studentId: r.studentId,
    status: r.status || 'ABSENT',
    markedBy: userId,
    auditHistory: []
  }));

  await AttendanceRecord.insertMany(recordDocs, { ordered: false });

  // 7. Recompute and persist aggregate counts
  const [presentCount, absentCount, lateCount] = await Promise.all([
    AttendanceRecord.countDocuments({ sessionId: session._id, status: 'PRESENT' }),
    AttendanceRecord.countDocuments({ sessionId: session._id, status: 'ABSENT' }),
    AttendanceRecord.countDocuments({ sessionId: session._id, status: 'LATE' })
  ]);

  session.presentCount = presentCount;
  session.absentCount = absentCount;
  session.lateCount = lateCount;
  await session.save();

  // 8. Return populated session
  return AttendanceSession.findById(session._id)
    .populate('subjectId', 'subjectCode name credits')
    .populate('facultyId', 'facultyCode department')
    .lean();
};

// ─── 3. List sessions for authenticated faculty ───────────────────────────
export const listSessions = async (query, userId) => {
  const faculty = await resolveFaculty(userId);

  const filter = { facultyId: faculty._id };

  if (query.assignmentId) filter.assignmentId = query.assignmentId;
  if (query.subjectId)    filter.subjectId    = query.subjectId;
  if (query.section)      filter.section      = query.section.toUpperCase();

  // Date range filter
  if (query.dateFrom || query.dateTo) {
    filter.date = {};
    if (query.dateFrom) filter.date.$gte = new Date(query.dateFrom);
    if (query.dateTo) {
      const to = new Date(query.dateTo);
      to.setUTCHours(23, 59, 59, 999);
      filter.date.$lte = to;
    }
  }

  const page  = Number(query.page)  || 1;
  const limit = Number(query.limit) || 20;
  const skip  = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    AttendanceSession.find(filter)
      .populate('subjectId', 'subjectCode name')
      .sort({ date: -1, sessionSlot: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AttendanceSession.countDocuments(filter)
  ]);

  return {
    sessions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
};

// ─── 4. Get a single session with its records ─────────────────────────────
export const getSessionById = async (sessionId, userId) => {
  const faculty = await resolveFaculty(userId);

  const session = await AttendanceSession.findById(sessionId)
    .populate('subjectId', 'subjectCode name credits')
    .populate('facultyId', 'facultyCode department')
    .lean();

  if (!session) throwError('Attendance session not found.', 404);

  // Guard: only the faculty who created the session can view/edit it
  if (session.facultyId._id.toString() !== faculty._id.toString()) {
    throwError('You are not authorised to view this session.', 403);
  }

  const records = await AttendanceRecord.find({ sessionId })
    .populate({
      path: 'studentId',
      select: 'rollNumber department semester section',
      populate: { path: 'userId', select: 'name email' }
    })
    .sort({ 'studentId.rollNumber': 1 })
    .lean();

  return { session, records };
};

// ─── 5. Edit a single attendance record ──────────────────────────────────
/**
 * Updates status and appends an audit-history entry.
 * Also recomputes session aggregate counts.
 */
export const updateRecord = async (recordId, { status }, userId) => {
  const faculty = await resolveFaculty(userId);

  const record = await AttendanceRecord.findById(recordId);
  if (!record) throwError('Attendance record not found.', 404);

  // Authorisation: check the session belongs to this faculty
  const session = await AttendanceSession.findById(record.sessionId);
  if (!session) throwError('Parent session not found.', 404);

  if (session.facultyId.toString() !== faculty._id.toString()) {
    throwError('You are not authorised to edit records in this session.', 403);
  }

  if (record.status === status) {
    throwError(`Status is already '${status}'. No change made.`, 400);
  }

  // Append audit entry before changing status
  record.auditHistory.push({
    oldStatus: record.status,
    newStatus: status,
    modifiedBy: userId,
    modifiedAt: new Date()
  });

  record.status = status;
  record.markedBy = userId;
  await record.save();

  // Recompute session aggregates
  const [presentCount, absentCount, lateCount] = await Promise.all([
    AttendanceRecord.countDocuments({ sessionId: session._id, status: 'PRESENT' }),
    AttendanceRecord.countDocuments({ sessionId: session._id, status: 'ABSENT' }),
    AttendanceRecord.countDocuments({ sessionId: session._id, status: 'LATE' })
  ]);

  await AttendanceSession.findByIdAndUpdate(session._id, {
    presentCount,
    absentCount,
    lateCount
  });

  return record;
};

// ─── 6. Delete a session (cascade delete records) ────────────────────────
export const deleteSession = async (sessionId, userId) => {
  const faculty = await resolveFaculty(userId);

  const session = await AttendanceSession.findById(sessionId);
  if (!session) throwError('Attendance session not found.', 404);

  if (session.facultyId.toString() !== faculty._id.toString()) {
    throwError('You are not authorised to delete this session.', 403);
  }

  // Cascade delete all records
  await AttendanceRecord.deleteMany({ sessionId });
  await AttendanceSession.findByIdAndDelete(sessionId);

  return { message: `Session and ${session.totalStudents} attendance record(s) deleted successfully.` };
};
