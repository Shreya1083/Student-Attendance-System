import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const VALID_SLOTS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const VALID_STATUSES = ['PRESENT', 'ABSENT', 'LATE'];

// ── Single attendance record provided during session creation ──────────────
export const recordInputSchema = z.object({
  studentId: z
    .string({ required_error: 'Student ID is required' })
    .regex(objectIdRegex, 'Invalid Student ObjectId'),
  status: z
    .enum(['PRESENT', 'ABSENT', 'LATE'], {
      errorMap: () => ({ message: 'Status must be PRESENT, ABSENT, or LATE' })
    })
    .default('ABSENT')
});

// ── Create a new attendance session with all student records ───────────────
export const createSessionSchema = z.object({
  assignmentId: z
    .string({ required_error: 'Faculty assignment ID is required' })
    .regex(objectIdRegex, 'Invalid FacultyAssignment ObjectId'),

  date: z
    .string({ required_error: 'Session date is required' })
    .refine(
      (val) => {
        const d = new Date(val);
        return !isNaN(d.getTime());
      },
      { message: 'Date must be a valid ISO date string (e.g. 2026-11-18)' }
    ),

  sessionSlot: z.enum(VALID_SLOTS, {
    errorMap: () => ({
      message: `Session slot must be one of: ${VALID_SLOTS.join(', ')} (lecture period number)`
    })
  }),

  topic: z.string().trim().max(200, 'Topic cannot exceed 200 characters').optional().default(''),

  // Array of { studentId, status } — must cover all enrolled students
  records: z
    .array(recordInputSchema)
    .min(1, 'At least one attendance record is required')
});

// ── Edit a single attendance record ───────────────────────────────────────
export const updateRecordSchema = z.object({
  status: z.enum(VALID_STATUSES, {
    errorMap: () => ({ message: 'Status must be PRESENT, ABSENT, or LATE' })
  })
});

// ── Query params for listing sessions ─────────────────────────────────────
export const listSessionsQuerySchema = z.object({
  assignmentId: z
    .string()
    .regex(objectIdRegex, 'Invalid FacultyAssignment ObjectId')
    .optional(),
  subjectId: z
    .string()
    .regex(objectIdRegex, 'Invalid Subject ObjectId')
    .optional(),
  section: z.string().trim().toUpperCase().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20)
});
