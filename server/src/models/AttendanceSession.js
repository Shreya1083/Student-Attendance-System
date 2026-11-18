import mongoose from 'mongoose';

const { Schema } = mongoose;

const attendanceSessionSchema = new Schema(
  {
    // References
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required']
    },
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Faculty reference is required']
    },
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'FacultyAssignment',
      required: [true, 'Faculty assignment reference is required']
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required']
    },

    // Session identity
    department: {
      type: String,
      required: [true, 'Department is required'],
      uppercase: true,
      trim: true
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8']
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      uppercase: true,
      trim: true
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true
    },

    // Session scheduling
    date: {
      type: Date,
      required: [true, 'Session date is required']
    },
    // Lecture period / slot number within the day (1–8)
    sessionSlot: {
      type: String,
      required: [true, 'Session slot is required'],
      enum: {
        values: ['1', '2', '3', '4', '5', '6', '7', '8'],
        message: 'Session slot must be a lecture period number between 1 and 8'
      }
    },
    topic: {
      type: String,
      trim: true,
      default: ''
    },

    // Aggregate counts (denormalised for quick reads)
    totalStudents: {
      type: Number,
      default: 0
    },
    presentCount: {
      type: Number,
      default: 0
    },
    absentCount: {
      type: Number,
      default: 0
    },
    lateCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Prevent duplicate sessions: one slot per subject per section per day
attendanceSessionSchema.index(
  { subjectId: 1, date: 1, sessionSlot: 1, academicYear: 1, semester: 1, section: 1 },
  { unique: true }
);

// Speed up "sessions for a faculty" queries
attendanceSessionSchema.index({ facultyId: 1, date: -1 });
attendanceSessionSchema.index({ subjectId: 1, section: 1, academicYear: 1 });

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);

export default AttendanceSession;
