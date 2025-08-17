import mongoose, { Schema, Document } from 'mongoose';
import { ApplicationStatus } from '../types';

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  resumeUrl?: string;
  resumeData?: string;
  resumeFileName?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  yearsOfExperience: number;
  currentRole?: string;
  coverLetter?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  applicantId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant ID is required']
  },
  status: {
    type: String,
    enum: ['APPLIED', 'UNDER_REVIEW', 'INTERVIEW', 'OFFER', 'REJECTED'],
    default: 'APPLIED',
    required: true
  },
  resumeUrl: {
    type: String,
    maxlength: [500, 'Resume URL cannot exceed 500 characters']
  },
  resumeData: {
    type: String, // Store as base64 string instead of Buffer
    select: false // Don't include in regular queries
  },
  resumeFileName: {
    type: String,
    maxlength: [255, 'File name cannot exceed 255 characters']
  },
  applicantName: {
    type: String,
    required: [true, 'Applicant name is required'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  applicantEmail: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  applicantPhone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[+]?[\d\s\-().]+$/, 'Please provide a valid phone number']
  },
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Years of experience cannot be negative'],
    max: [50, 'Years of experience seems too high']
  },
  currentRole: {
    type: String,
    maxlength: [100, 'Current role cannot exceed 100 characters']
  },
  coverLetter: {
    type: String,
    maxlength: [3000, 'Cover letter cannot exceed 3000 characters']
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
ApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true }); // Prevent duplicate applications
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ applicantId: 1, createdAt: -1 });

// Update the updatedAt timestamp on save
ApplicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IApplication>('Application', ApplicationSchema);