import mongoose from 'mongoose';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Semester from '../models/Semester.js';
import Section from '../models/Section.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import FacultyAssignment from '../models/FacultyAssignment.js';
import { connectDB } from '../config/db.js';
import { logger } from './logger.js';

export const defaultUsers = [
  {
    name: 'System Administrator',
    email: 'admin@attendance.edu',
    password: 'Admin@123456',
    role: 'ADMIN',
    isActive: true
  },
  {
    name: 'Dr. Ramesh Kumar',
    email: 'ramesh@attendance.edu',
    password: 'Faculty@123456',
    role: 'FACULTY',
    isActive: true
  },
  {
    name: 'Dr. Jane Smith (Faculty)',
    email: 'faculty@attendance.edu',
    password: 'Faculty@123456',
    role: 'FACULTY',
    isActive: true
  },
  {
    name: 'Priya Sharma',
    email: 'priya@attendance.edu',
    password: 'Student@123456',
    role: 'STUDENT',
    isActive: true
  },
  {
    name: 'John Doe (Student)',
    email: 'student@attendance.edu',
    password: 'Student@123456',
    role: 'STUDENT',
    isActive: true
  },
  {
    name: 'Deactivated User',
    email: 'inactive@attendance.edu',
    password: 'Inactive@123456',
    role: 'STUDENT',
    isActive: false
  }
];

export const seedUsers = async () => {
  logger.info('Starting master data & user seeder...');

  // 1. Seed Departments
  const departments = [
    { departmentName: 'Computer Science & Engineering', departmentCode: 'CSE', description: 'Department of CSE' },
    { departmentName: 'Electronics & Communication', departmentCode: 'ECE', description: 'Department of ECE' },
    { departmentName: 'Mechanical Engineering', departmentCode: 'MECH', description: 'Department of MECH' }
  ];

  for (const dept of departments) {
    await Department.findOneAndUpdate({ departmentCode: dept.departmentCode }, dept, { upsert: true, new: true });
    logger.info(`Department verified: ${dept.departmentCode}`);
  }

  // 2. Seed Semesters & Sections for CSE
  const academicYear = '2026-2027';
  for (let sem = 1; sem <= 8; sem++) {
    await Semester.findOneAndUpdate(
      { department: 'CSE', semesterNumber: sem, academicYear },
      { department: 'CSE', semesterNumber: sem, academicYear },
      { upsert: true }
    );

    for (const sec of ['A', 'B']) {
      await Section.findOneAndUpdate(
        { department: 'CSE', semester: sem, sectionName: sec, academicYear },
        { department: 'CSE', semester: sem, sectionName: sec, academicYear },
        { upsert: true }
      );
    }
  }

  // 3. Seed Subjects for CSE 5th Semester
  const subjects = [
    { subjectCode: 'CS501', name: 'Software Engineering & Project Management', department: 'CSE', semester: 5, credits: 4 },
    { subjectCode: 'CS502', name: 'Database Management Systems', department: 'CSE', semester: 5, credits: 4 },
    { subjectCode: 'CS503', name: 'Computer Networks', department: 'CSE', semester: 5, credits: 3 }
  ];

  for (const sub of subjects) {
    await Subject.findOneAndUpdate({ subjectCode: sub.subjectCode }, sub, { upsert: true, new: true });
    logger.info(`Subject verified: ${sub.subjectCode} - ${sub.name}`);
  }

  // 4. Seed Base Users
  let adminUser, facultyUser, studentUser;
  for (const userData of defaultUsers) {
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create(userData);
      logger.info(`Created default user [${userData.role}]: ${userData.email}`);
    }
    if (user.role === 'ADMIN') adminUser = user;
    if (user.role === 'FACULTY') facultyUser = user;
    if (user.role === 'STUDENT' && user.isActive) studentUser = user;
  }

  // 5. Link Faculty Profiles
  const rameshUser = await User.findOne({ email: 'ramesh@attendance.edu' });
  let rameshProfile = null;
  if (rameshUser) {
    rameshProfile = await Faculty.findOneAndUpdate(
      { userId: rameshUser._id },
      {
        userId: rameshUser._id,
        facultyCode: 'FAC-CSE-001',
        department: 'CSE',
        designation: 'Professor & HOD',
        isActive: true
      },
      { upsert: true, new: true }
    );
    logger.info(`Faculty profile verified for: ${rameshProfile.facultyCode} (Dr. Ramesh Kumar)`);
  }

  const janeUser = await User.findOne({ email: 'faculty@attendance.edu' });
  let janeProfile = null;
  if (janeUser) {
    janeProfile = await Faculty.findOneAndUpdate(
      { userId: janeUser._id },
      {
        userId: janeUser._id,
        facultyCode: 'FAC-CSE-002',
        department: 'CSE',
        designation: 'Associate Professor',
        isActive: true
      },
      { upsert: true, new: true }
    );
    logger.info(`Faculty profile verified for: ${janeProfile.facultyCode} (Dr. Jane Smith)`);
  }

  // 6. Link Student Profiles
  const priyaUser = await User.findOne({ email: 'priya@attendance.edu' });
  if (priyaUser) {
    const priyaProfile = await Student.findOneAndUpdate(
      { userId: priyaUser._id },
      {
        userId: priyaUser._id,
        rollNumber: 'CSE24001',
        department: 'CSE',
        semester: 5,
        section: 'A',
        academicYear: '2026-2027',
        isActive: true
      },
      { upsert: true, new: true }
    );
    logger.info(`Student profile verified for: ${priyaProfile.rollNumber} (Priya Sharma)`);
  }

  const johnUser = await User.findOne({ email: 'student@attendance.edu' });
  if (johnUser) {
    const johnProfile = await Student.findOneAndUpdate(
      { userId: johnUser._id },
      {
        userId: johnUser._id,
        rollNumber: 'CSE24002',
        department: 'CSE',
        semester: 5,
        section: 'A',
        academicYear: '2026-2027',
        isActive: true
      },
      { upsert: true, new: true }
    );
    logger.info(`Student profile verified for: ${johnProfile.rollNumber} (John Doe)`);
  }

  // 7. Seed Faculty Assignments
  const cs501 = await Subject.findOne({ subjectCode: 'CS501' });
  const cs502 = await Subject.findOne({ subjectCode: 'CS502' });

  if (rameshProfile && cs501) {
    await FacultyAssignment.findOneAndUpdate(
      {
        facultyId: rameshProfile._id,
        subjectId: cs501._id,
        academicYear: '2026-2027',
        semester: 5,
        section: 'A'
      },
      {
        facultyId: rameshProfile._id,
        subjectId: cs501._id,
        department: 'CSE',
        semester: 5,
        section: 'A',
        academicYear: '2026-2027',
        isActive: true
      },
      { upsert: true }
    );
    logger.info(`Faculty Assignment verified: Dr. Ramesh Kumar -> CS501 (CSE 5-A)`);
  }

  if (janeProfile && cs502) {
    await FacultyAssignment.findOneAndUpdate(
      {
        facultyId: janeProfile._id,
        subjectId: cs502._id,
        academicYear: '2026-2027',
        semester: 5,
        section: 'A'
      },
      {
        facultyId: janeProfile._id,
        subjectId: cs502._id,
        department: 'CSE',
        semester: 5,
        section: 'A',
        academicYear: '2026-2027',
        isActive: true
      },
      { upsert: true }
    );
    logger.info(`Faculty Assignment verified: Dr. Jane Smith -> CS502 (CSE 5-A)`);
  }

  logger.info('Master data and user seeding completed successfully.');
};

if (process.argv[1] && process.argv[1].endsWith('seedUsers.js')) {
  (async () => {
    try {
      const conn = await connectDB();
      if (!conn) {
        logger.error('Cannot seed users: MongoDB connection failed.');
        process.exit(1);
      }
      await seedUsers();
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      logger.error(`Seeding error: ${err.message}`);
      process.exit(1);
    }
  })();
}
