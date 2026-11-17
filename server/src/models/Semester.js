import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema(
  {
    semesterNumber: {
      type: Number,
      required: [true, 'Semester number is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      uppercase: true,
      trim: true
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate semester configurations for the same department and academic year
semesterSchema.index(
  { department: 1, semesterNumber: 1, academicYear: 1 },
  { unique: true }
);

const Semester = mongoose.model('Semester', semesterSchema);

export default Semester;
