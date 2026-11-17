import mongoose from 'mongoose';

const facultyAssignmentSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Faculty reference is required']
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required']
    },
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
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate assignments for the same faculty, subject, academic year, semester, and section
facultyAssignmentSchema.index(
  { facultyId: 1, subjectId: 1, academicYear: 1, semester: 1, section: 1 },
  { unique: true }
);

const FacultyAssignment = mongoose.model('FacultyAssignment', facultyAssignmentSchema);

export default FacultyAssignment;
