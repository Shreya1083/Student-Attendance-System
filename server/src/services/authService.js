import User from '../models/User.js';
import Student from '../models/Student.js';
import Department from '../models/Department.js';
import Semester from '../models/Semester.js';
import Section from '../models/Section.js';
import { generateToken, blacklistToken } from './tokenService.js';

export const loginUser = async ({ email, password }) => {
  // 1. Fetch user by email, explicitly including password field for verification
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // 2. Reject inactive accounts
  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact an administrator.');
    error.statusCode = 403;
    throw error;
  }

  // 3. Verify password hash using bcrypt
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // 4. Update last login timestamp
  user.lastLogin = new Date();
  await user.save();

  // 5. Generate signed JWT token
  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated');
    error.statusCode = 403;
    throw error;
  }

  return user.toJSON();
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  // Update password and increment token version to invalidate existing tokens
  user.password = newPassword;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  // Generate a new token with updated tokenVersion
  const newToken = generateToken(user);

  return {
    message: 'Password changed successfully',
    token: newToken
  };
};

export const logoutUser = async (userId, token) => {
  // 1. Blacklist token immediately in-memory
  if (token) {
    blacklistToken(token);
  }

  // 2. Increment tokenVersion in database if user ID is provided
  if (userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: { tokenVersion: 1 }
      });
    } catch {
      // Continue even if DB update encounters transient issue
    }
  }

  return {
    message: 'Successfully logged out'
  };
};

export const registerStudent = async (data) => {
  // 1. Check duplicate email in User
  const existingEmail = await User.findOne({ email: data.email.toLowerCase() });
  if (existingEmail) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  // 2. Check duplicate rollNumber (USN) in Student
  const existingRoll = await Student.findOne({ rollNumber: data.rollNumber.toUpperCase() });
  if (existingRoll) {
    const error = new Error('A student with this USN / Student ID is already registered');
    error.statusCode = 409;
    throw error;
  }

  // 3. Create base User account with role 'STUDENT' strictly
  let createdUser;
  try {
    createdUser = await User.create({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password, // Pre-save hook hashes with bcrypt (>= 10 rounds)
      role: 'STUDENT',
      isActive: true
    });
  } catch (err) {
    throw err;
  }

  // 4. Create linked Student profile
  let studentProfile;
  try {
    studentProfile = await Student.create({
      userId: createdUser._id,
      rollNumber: data.rollNumber.toUpperCase().trim(),
      department: data.department.toUpperCase().trim(),
      semester: Number(data.semester),
      section: data.section.toUpperCase().trim(),
      academicYear: data.academicYear || '2026-2027',
      isActive: true
    });
  } catch (err) {
    // Rollback user if student profile creation fails
    await User.findByIdAndDelete(createdUser._id);
    throw err;
  }

  // 5. Generate signed JWT token
  const token = generateToken(createdUser);

  const populatedUser = createdUser.toJSON();
  populatedUser.studentProfile = {
    rollNumber: studentProfile.rollNumber,
    department: studentProfile.department,
    semester: studentProfile.semester,
    section: studentProfile.section,
    academicYear: studentProfile.academicYear
  };

  return {
    user: populatedUser,
    token
  };
};

export const getAcademicOptions = async () => {
  const [departments, semesters, sections] = await Promise.all([
    Department.find({ isActive: true }).select('departmentCode departmentName').sort({ departmentCode: 1 }),
    Semester.find({ isActive: true }).select('semesterNumber department academicYear').sort({ semesterNumber: 1 }),
    Section.find({ isActive: true }).select('sectionName department semester academicYear').sort({ sectionName: 1 })
  ]);

  return {
    departments,
    semesters,
    sections
  };
};
