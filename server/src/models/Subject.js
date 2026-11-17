import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      minlength: [2, 'Subject name must be at least 2 characters long'],
      maxlength: [120, 'Subject name cannot exceed 120 characters']
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
    credits: {
      type: Number,
      default: 3,
      min: [1, 'Credits must be at least 1'],
      max: [6, 'Credits cannot exceed 6']
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

subjectSchema.index({ department: 1, semester: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
