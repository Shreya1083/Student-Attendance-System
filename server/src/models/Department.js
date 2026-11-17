import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      minlength: [2, 'Department name must be at least 2 characters long'],
      maxlength: [100, 'Department name cannot exceed 100 characters']
    },
    departmentCode: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [2, 'Department code must be at least 2 characters long'],
      maxlength: [10, 'Department code cannot exceed 10 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
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

const Department = mongoose.model('Department', departmentSchema);

export default Department;
