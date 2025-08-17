export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'applicant' | 'recruiter';
  createdAt: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  deadline: string;
  recruiterId: string | User;
  createdAt: string;
}

export type ApplicationStatus = 'APPLIED' | 'UNDER_REVIEW' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface Application {
  _id: string;
  jobId: string | Job;
  applicantId: string | User;
  status: ApplicationStatus;
  resumeUrl?: string;
  resumeFileName?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  yearsOfExperience: number;
  currentRole?: string;
  coverLetter?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AnalyticsSummary {
  totalApplicants: number;
  perJobCounts: Array<{
    jobId: string;
    title: string;
    count: number;
  }>;
  statusDistribution: Record<ApplicationStatus, number>;
  avgExperiencePerJob: Array<{
    jobId: string;
    title: string;
    avgExperience: number;
    minExperience: number;
    maxExperience: number;
  }>;
}