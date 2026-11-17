import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    sectionName: {
      type: String,
      required: [true, 'Section name is required'],
      uppercase: true,
      trim: true,
      maxlength: [5, 'Section name cannot exceed 5 characters']
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

// Prevent duplicate section configurations within the same department, semester, and academic year
sectionSchema.index(
  { department: 1, semester: 1, sectionName: 1, academicYear: 1 },
  { unique: true }
);

const Section = mongoose.model('Section', sectionSchema);

export default Section;
