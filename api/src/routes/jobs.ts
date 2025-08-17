import { Router, Request, Response } from 'express';
import Job from '../models/Job';
import Application from '../models/Application';
import { AuthRequest } from '../types';
import { authGuard, authorize } from '../middleware/auth';
import { createJobSchema, updateJobSchema, jobQuerySchema } from '../utils/validators';

const router = Router();

// Debug endpoint to check all jobs
router.get('/debug', async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await Job.find().select('title recruiterId createdAt');
    const count = await Job.countDocuments();
    res.json({ 
      totalJobs: count,
      jobs: jobs.map(j => ({
        id: j._id,
        title: j.title,
        recruiterId: j.recruiterId,
        createdAt: j.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get recruiter's own jobs
router.get('/my-jobs', authGuard, authorize('recruiter'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Fetching jobs for recruiter:', req.user?.id);
    const jobs = await Job.find({ recruiterId: req.user?.id })
      .sort({ createdAt: -1 });
    
    console.log('Found jobs:', jobs.length);
    res.json({ items: jobs });
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    res.status(500).json({ error: 'Failed to fetch your jobs' });
  }
});

// Create new job (recruiter only)
router.post('/', authGuard, authorize('recruiter'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createJobSchema.parse(req.body);
    
    console.log('Creating job with recruiterId:', req.user?.id);
    
    const job = new Job({
      ...validatedData,
      deadline: new Date(validatedData.deadline),
      recruiterId: req.user?.id
    });

    await job.save();
    console.log('Job created:', job._id, 'by recruiter:', job.recruiterId);
    res.status(201).json({ job });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Get all jobs with search, filters, and pagination
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, location, sort = 'createdAt:desc', page = '1', pageSize = '10' } = jobQuerySchema.parse(req.query);
    
    const pageNum = typeof page === 'number' ? page : parseInt(page, 10);
    const size = typeof pageSize === 'number' ? pageSize : parseInt(pageSize, 10);
    const skip = (pageNum - 1) * size;

    // Build query
    const query: any = {};
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Only show jobs with future deadlines
    query.deadline = { $gte: new Date() };

    // Parse sort parameter
    const [sortField, sortOrder] = sort.split(':');
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortField] = sortOrder === 'desc' ? -1 : 1;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(size),
      Job.countDocuments(query)
    ]);

    res.json({
      items: jobs,
      page: pageNum,
      pageSize: size,
      total
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ... rest of your routes unchanged (/:id, patch, delete, applications, etc.)

export default router;
