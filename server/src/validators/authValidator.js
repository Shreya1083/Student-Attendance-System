import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty')
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: 'Current password is required' })
      .min(1, 'Current password cannot be empty'),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(8, 'New password must be at least 8 characters long')
      .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'New password must contain at least one numeric digit')
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password cannot be identical to the current password',
    path: ['newPassword']
  });

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name cannot exceed 100 characters'),
    rollNumber: z
      .string({ required_error: 'USN / Student ID is required' })
      .trim()
      .toUpperCase()
      .min(2, 'USN / Student ID must be at least 2 characters long')
      .max(20, 'USN / Student ID cannot exceed 20 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one numeric digit'),
    confirmPassword: z
      .string({ required_error: 'Confirm password is required' }),
    department: z
      .string({ required_error: 'Department is required' })
      .trim()
      .toUpperCase()
      .min(2, 'Department is required'),
    semester: z.coerce
      .number({ required_error: 'Semester is required' })
      .int()
      .min(1, 'Semester must be between 1 and 8')
      .max(8, 'Semester must be between 1 and 8'),
    section: z
      .string({ required_error: 'Section is required' })
      .trim()
      .toUpperCase()
      .min(1, 'Section is required')
      .max(5, 'Section cannot exceed 5 characters'),
    academicYear: z
      .string()
      .trim()
      .optional()
      .default('2026-2027')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });
