import { Request } from 'express';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'applicant' | 'recruiter';
  createdAt: Date;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  deadline: Date;
  recruiterId: string;
  createdAt: Date;
}

export type ApplicationStatus = 'APPLIED' | 'UNDER_REVIEW' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface Application {
  _id: string;
  jobId: string;
  applicantId: string;
  status: ApplicationStatus;
  resumeUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthPayload {
  sub: string;
  role: 'applicant' | 'recruiter';
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'applicant' | 'recruiter';
  };
}