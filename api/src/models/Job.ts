import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  deadline: Date;
  recruiterId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const JobSchema = new Schema<IJob>({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  requirements: {
    type: String,
    maxlength: [3000, 'Requirements cannot exceed 3000 characters']
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required'],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  recruiterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recruiter ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
JobSchema.index({ recruiterId: 1, createdAt: -1 });
JobSchema.index({ title: 'text', description: 'text' }); // Text search
JobSchema.index({ deadline: 1 });

export default mongoose.model<IJob>('Job', JobSchema);