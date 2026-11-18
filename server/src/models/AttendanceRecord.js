import mongoose from 'mongoose';

const { Schema } = mongoose;

// Embedded audit entry — no _id needed
const auditEntrySchema = new Schema(
  {
    oldStatus: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE'],
      required: true
    },
    newStatus: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE'],
      required: true
    },
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const attendanceRecordSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'AttendanceSession',
      required: [true, 'Session reference is required']
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required']
    },
    // PRESENT | ABSENT | LATE
    // LATE counts as attended: (PRESENT + LATE) / total * 100
    status: {
      type: String,
      enum: {
        values: ['PRESENT', 'ABSENT', 'LATE'],
        message: 'Status must be PRESENT, ABSENT, or LATE'
      },
      required: [true, 'Attendance status is required'],
      default: 'ABSENT'
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Marker user reference is required']
    },
    // Full audit trail — appended on every edit
    auditHistory: {
      type: [auditEntrySchema],
      default: []
    }
  },
  { timestamps: true }
);

// Core uniqueness: one record per student per session
attendanceRecordSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

// Speed up "all records for a student" queries (Phase 5 student view)
attendanceRecordSchema.index({ studentId: 1, sessionId: 1 });

// Speed up per-session listing
attendanceRecordSchema.index({ sessionId: 1 });

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);

export default AttendanceRecord;
