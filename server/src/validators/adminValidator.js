import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const departmentSchema = z.object({
  departmentName: z
    .string({ required_error: 'Department name is required' })
    .trim()
    .min(2, 'Department name must be at least 2 characters long')
    .max(100, 'Department name cannot exceed 100 characters'),
  departmentCode: z
    .string({ required_error: 'Department code is required' })
    .trim()
    .toUpperCase()
    .min(2, 'Department code must be at least 2 characters long')
    .max(10, 'Department code cannot exceed 10 characters'),
  description: z.string().trim().max(500).optional().default(''),
  isActive: z.boolean().optional().default(true)
});

export const semesterSchema = z.object({
  semesterNumber: z.coerce
    .number({ required_error: 'Semester number is required' })
    .int()
    .min(1, 'Semester must be between 1 and 8')
    .max(8, 'Semester must be between 1 and 8'),
  department: z
    .string({ required_error: 'Department code is required' })
    .trim()
    .toUpperCase(),
  academicYear: z
    .string({ required_error: 'Academic year is required' })
    .trim()
    .min(4, 'Academic year is required (e.g. 2026-2027)'),
  isActive: z.boolean().optional().default(true)
});

export const sectionSchema = z.object({
  sectionName: z
    .string({ required_error: 'Section name is required' })
    .trim()
    .toUpperCase()
    .min(1, 'Section name cannot be empty')
    .max(5, 'Section name cannot exceed 5 characters'),
  department: z
    .string({ required_error: 'Department code is required' })
    .trim()
    .toUpperCase(),
  semester: z.coerce
    .number({ required_error: 'Semester is required' })
    .int()
    .min(1, 'Semester must be between 1 and 8')
    .max(8, 'Semester must be between 1 and 8'),
  academicYear: z
    .string({ required_error: 'Academic year is required' })
    .trim()
    .min(4, 'Academic year is required'),
  isActive: z.boolean().optional().default(true)
});

export const subjectSchema = z.object({
  subjectCode: z
    .string({ required_error: 'Subject code is required' })
    .trim()
    .toUpperCase()
    .min(2, 'Subject code must be at least 2 characters long'),
  name: z
    .string({ required_error: 'Subject name is required' })
    .trim()
    .min(2, 'Subject name must be at least 2 characters long')
    .max(120, 'Subject name cannot exceed 120 characters'),
  department: z
    .string({ required_error: 'Department code is required' })
    .trim()
    .toUpperCase(),
  semester: z.coerce
    .number({ required_error: 'Semester is required' })
    .int()
    .min(1, 'Semester must be between 1 and 8')
    .max(8, 'Semester must be between 1 and 8'),
  credits: z.coerce
    .number()
    .int()
    .min(1, 'Credits must be at least 1')
    .max(6, 'Credits cannot exceed 6')
    .optional()
    .default(3),
  isActive: z.boolean().optional().default(true)
});

export const studentSchema = z.object({
  name: z
    .string({ required_error: 'Student name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters long'),
  email: z
    .string({ required_error: 'Student email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .optional(),
  rollNumber: z
    .string({ required_error: 'Roll number is required' })
    .trim()
    .toUpperCase()
    .min(2, 'Roll number must be at least 2 characters long'),
  department: z
    .string({ required_error: 'Department is required' })
    .trim()
    .toUpperCase(),
  semester: z.coerce
    .number({ required_error: 'Semester is required' })
    .int()
    .min(1, 'Semester must be between 1 and 8')
    .max(8, 'Semester must be between 1 and 8'),
  section: z
    .string({ required_error: 'Section is required' })
    .trim()
    .toUpperCase(),
  academicYear: z
    .string({ required_error: 'Academic year is required' })
    .trim()
    .min(4, 'Academic year is required'),
  isActive: z.boolean().optional().default(true)
});

export const bulkStudentSchema = z.object({
  students: z
    .array(studentSchema)
    .min(1, 'At least one student must be provided for bulk upload')
});

export const facultySchema = z.object({
  name: z
    .string({ required_error: 'Faculty name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters long'),
  email: z
    .string({ required_error: 'Faculty email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .optional(),
  facultyCode: z
    .string({ required_error: 'Faculty code is required' })
    .trim()
    .toUpperCase()
    .min(2, 'Faculty code must be at least 2 characters long'),
  department: z
    .string({ required_error: 'Department is required' })
    .trim()
    .toUpperCase(),
  designation: z
    .string()
    .trim()
    .optional()
    .default('Assistant Professor'),
  isActive: z.boolean().optional().default(true)
});

export const assignmentSchema = z.object({
  facultyId: z
    .string({ required_error: 'Faculty ID is required' })
    .regex(objectIdRegex, 'Invalid Faculty ObjectId'),
  subjectId: z
    .string({ required_error: 'Subject ID is required' })
    .regex(objectIdRegex, 'Invalid Subject ObjectId'),
  department: z
    .string({ required_error: 'Department is required' })
    .trim()
    .toUpperCase(),
  semester: z.coerce
    .number({ required_error: 'Semester is required' })
    .int()
    .min(1, 'Semester must be between 1 and 8')
    .max(8, 'Semester must be between 1 and 8'),
  section: z
    .string({ required_error: 'Section is required' })
    .trim()
    .toUpperCase(),
  academicYear: z
    .string({ required_error: 'Academic year is required' })
    .trim()
    .min(4, 'Academic year is required'),
  isActive: z.boolean().optional().default(true)
});
