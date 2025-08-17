import { z } from 'zod';

// Auth validators
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['applicant', 'recruiter'])
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Job validators
export const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  requirements: z.string().max(3000).optional(),
  location: z.string().max(100).optional(),
  deadline: z.string().datetime()
});

export const updateJobSchema = createJobSchema.partial();

// Application validators
export const createApplicationSchema = z.object({
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid job ID'),
  resumeUrl: z.string().url().max(500).optional()
});

export const updateApplicationSchema = z.object({
  status: z.enum(['APPLIED', 'UNDER_REVIEW', 'INTERVIEW', 'OFFER', 'REJECTED']).optional(),
  notes: z.string().max(2000).optional()
});

// Query validators
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  pageSize: z.string().regex(/^\d+$/).transform(Number).default('10')
});

export const jobQuerySchema = paginationSchema.extend({
  q: z.string().optional(),
  location: z.string().optional(),
  sort: z.enum(['createdAt:desc', 'createdAt:asc', 'title:asc', 'title:desc']).optional()
});