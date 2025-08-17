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
    
    const pageNum = parseInt(page);
    const size = parseInt(pageSize);
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
    const sortObj: any = {};
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

// Get single job (public endpoint - no auth required)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiterId', 'name email');
    
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json({ job });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Update job (recruiter only, must own the job)
router.patch('/:id', authGuard, authorize('recruiter'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = updateJobSchema.parse(req.body);
    
    // Check ownership
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.recruiterId.toString() !== req.user?.id) {
      res.status(403).json({ error: 'You can only update your own jobs' });
      return;
    }

    // Update job
    Object.assign(job, validatedData);
    if (validatedData.deadline) {
      job.deadline = new Date(validatedData.deadline);
    }
    
    await job.save();
    res.json({ job });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job (recruiter only, must own the job)
router.delete('/:id', authGuard, authorize('recruiter'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.recruiterId.toString() !== req.user?.id) {
      res.status(403).json({ error: 'You can only delete your own jobs' });
      return;
    }

    // Delete job and related applications
    await Promise.all([
      Job.findByIdAndDelete(req.params.id),
      Application.deleteMany({ jobId: req.params.id })
    ]);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Get applications for a job (recruiter only, must own the job)
router.get('/:id/applications', authGuard, authorize('recruiter'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.recruiterId.toString() !== req.user?.id) {
      res.status(403).json({ error: 'You can only view applications for your own jobs' });
      return;
    }

    const applications = await Application.find({ jobId: req.params.id })
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 });

    // Group by status for Kanban board
    const byStatus = {
      APPLIED: [],
      UNDER_REVIEW: [],
      INTERVIEW: [],
      OFFER: [],
      REJECTED: []
    } as Record<string, any[]>;

    applications.forEach(app => {
      byStatus[app.status].push(app);
    });

    res.json({ byStatus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

export default router;