import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    },
    facultyCode: {
      type: String,
      required: [true, 'Faculty code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      uppercase: true,
      trim: true
    },
    designation: {
      type: String,
      default: 'Assistant Professor',
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

facultySchema.index({ department: 1 });

const Faculty = mongoose.model('Faculty', facultySchema);

export default Faculty;
