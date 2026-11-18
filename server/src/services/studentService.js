import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import AttendanceSession from '../models/AttendanceSession.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import Notification from '../models/Notification.js';
import SystemSetting from '../models/SystemSetting.js';

const throwError = (msg, code = 400) => {
  const e = new Error(msg);
  e.statusCode = code;
  throw e;
};

/**
 * Resolve the Student profile that belongs to the authenticated User.
 */
export const resolveStudent = async (userId) => {
  const student = await Student.findOne({ userId }).populate('userId', 'name email');
  if (!student) {
    throwError('No student profile found for this authenticated user account.', 404);
  }
  return student;
};

/**
 * Retrieve low-attendance threshold (default 75%)
 */
export const getThreshold = async () => {
  try {
    const setting = await SystemSetting.findOne({ key: 'LOW_ATTENDANCE_THRESHOLD' });
    return setting && setting.value ? Number(setting.value) : 75;
  } catch {
    return 75;
  }
};

/**
 * Get student profile
 */
export const getProfile = async (userId) => {
  const student = await resolveStudent(userId);
  return {
    _id: student._id,
    name: student.userId?.name,
    email: student.userId?.email,
    rollNumber: student.rollNumber,
    department: student.department,
    semester: student.semester,
    section: student.section,
    academicYear: student.academicYear,
    isActive: student.isActive
  };
};

/**
 * Get subject-wise attendance and overall calculation for the student
 */
export const getMyAttendance = async (userId) => {
  const student = await resolveStudent(userId);
  const threshold = await getThreshold();

  // Find all active curriculum subjects for student's department and semester
  const subjects = await Subject.find({
    department: student.department,
    semester: student.semester,
    isActive: true
  }).sort({ subjectCode: 1 });

  let totalClassesConductedOverall = 0;
  let totalClassesAttendedOverall = 0;
  const subjectSummaries = [];

  for (const subject of subjects) {
    // Find all sessions conducted for this subject and cohort
    const sessions = await AttendanceSession.find({
      subjectId: subject._id,
      department: student.department,
      semester: student.semester,
      section: student.section,
      academicYear: student.academicYear
    }).sort({ date: -1 });

    const totalSessions = sessions.length;
    const sessionIds = sessions.map((s) => s._id);

    // Find attendance records for this student in these sessions
    const records = await AttendanceRecord.find({
      sessionId: { $in: sessionIds },
      studentId: student._id
    });

    const presentCount = records.filter((r) => r.status === 'PRESENT').length;
    const lateCount = records.filter((r) => r.status === 'LATE').length;
    const absentCount = records.filter((r) => r.status === 'ABSENT').length;

    // PRESENT and LATE both count as attended credit (100% attendance credit)
    const attendedSessions = presentCount + lateCount;

    // Attendance calculation: (Attended / Total Conducted) * 100
    const attendancePercentage =
      totalSessions > 0
        ? Number(((attendedSessions / totalSessions) * 100).toFixed(1))
        : 100.0;

    const isShortage = totalSessions > 0 && attendancePercentage < threshold;

    // Trigger low attendance alert if shortage exists and no active unread alert
    if (isShortage) {
      const existingAlert = await Notification.findOne({
        studentId: student._id,
        subjectId: subject._id,
        isRead: false
      });

      if (!existingAlert) {
        await Notification.create({
          studentId: student._id,
          subjectId: subject._id,
          message: `Attendance warning: Your attendance in ${subject.name} (${subject.subjectCode}) is currently ${attendancePercentage}%, which is below the institutional requirement of ${threshold}%.`,
          type: 'LOW_ATTENDANCE',
          attendancePct: attendancePercentage,
          isRead: false
        });
      }
    }

    totalClassesConductedOverall += totalSessions;
    totalClassesAttendedOverall += attendedSessions;

    subjectSummaries.push({
      subjectId: subject._id,
      subjectCode: subject.subjectCode,
      subjectName: subject.name,
      credits: subject.credits,
      totalSessions,
      attendedSessions,
      presentCount,
      lateCount,
      absentCount,
      attendancePercentage,
      status: totalSessions === 0 ? 'NO_DATA' : isShortage ? 'WARNING' : 'GOOD'
    });
  }

  const overallPercentage =
    totalClassesConductedOverall > 0
      ? Number(((totalClassesAttendedOverall / totalClassesConductedOverall) * 100).toFixed(1))
      : 100.0;

  return {
    student: {
      _id: student._id,
      name: student.userId?.name,
      rollNumber: student.rollNumber,
      department: student.department,
      semester: student.semester,
      section: student.section,
      academicYear: student.academicYear
    },
    threshold,
    overall: {
      totalConducted: totalClassesConductedOverall,
      totalAttended: totalClassesAttendedOverall,
      percentage: overallPercentage,
      isShortage: totalClassesConductedOverall > 0 && overallPercentage < threshold
    },
    subjects: subjectSummaries
  };
};

/**
 * Get detailed date-wise attendance history for a single subject
 */
export const getSubjectHistory = async (userId, subjectId) => {
  const student = await resolveStudent(userId);

  const subject = await Subject.findById(subjectId);
  if (!subject) throwError('Subject not found', 404);

  const sessions = await AttendanceSession.find({
    subjectId,
    department: student.department,
    semester: student.semester,
    section: student.section,
    academicYear: student.academicYear
  })
    .populate('facultyId', 'facultyCode')
    .sort({ date: -1, sessionSlot: 1 });

  const sessionIds = sessions.map((s) => s._id);
  const records = await AttendanceRecord.find({
    sessionId: { $in: sessionIds },
    studentId: student._id
  });

  const recordMap = new Map();
  records.forEach((r) => recordMap.set(r.sessionId.toString(), r));

  const history = sessions.map((s) => {
    const rec = recordMap.get(s._id.toString());
    return {
      sessionId: s._id,
      date: s.date,
      sessionSlot: s.sessionSlot,
      topic: s.topic,
      status: rec ? rec.status : 'NOT_MARKED',
      markedAt: rec?.createdAt,
      auditHistory: rec?.auditHistory || []
    };
  });

  return {
    subject: {
      _id: subject._id,
      subjectCode: subject.subjectCode,
      name: subject.name
    },
    totalSessions: sessions.length,
    history
  };
};

/**
 * Get student notifications
 */
export const getNotifications = async (userId) => {
  const student = await resolveStudent(userId);
  const notifications = await Notification.find({ studentId: student._id })
    .populate('subjectId', 'name subjectCode')
    .sort({ createdAt: -1 });

  return notifications;
};

/**
 * Mark a single notification as read
 */
export const markNotificationRead = async (userId, notificationId) => {
  const student = await resolveStudent(userId);
  const notification = await Notification.findOne({
    _id: notificationId,
    studentId: student._id
  });

  if (!notification) {
    throwError('Notification not found', 404);
  }

  notification.isRead = true;
  await notification.save();

  return notification;
};

/**
 * Mark all notifications as read for student
 */
export const markAllNotificationsRead = async (userId) => {
  const student = await resolveStudent(userId);
  await Notification.updateMany(
    { studentId: student._id, isRead: false },
    { $set: { isRead: true } }
  );

  return { message: 'All notifications marked as read' };
};
