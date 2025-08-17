import { Router, Response } from 'express';
import Application from '../models/Application';
import Job from '../models/Job';
import { AuthRequest } from '../types';
import { authGuard, authorize } from '../middleware/auth';

const router = Router();

// Get analytics summary (recruiter only)
router.get('/summary', authGuard, authorize('recruiter'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recruiterId = req.user?.id;

    // Get all jobs for this recruiter
    const recruiterJobs = await Job.find({ recruiterId });
    const jobIds = recruiterJobs.map(job => job._id);

    // Get total unique applicants
    const uniqueApplicants = await Application.distinct('applicantId', {
      jobId: { $in: jobIds }
    });

    // Get applications per job
    const perJobCounts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $project: {
          jobId: '$_id',
          title: '$job.title',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get status distribution
    const statusDistribution = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap: Record<string, number> = {
      APPLIED: 0,
      UNDER_REVIEW: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0
    };

    statusDistribution.forEach(item => {
      statusMap[item._id] = item.count;
    });

    // Get average experience per job
    const avgExperiencePerJob = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      {
        $group: {
          _id: '$jobId',
          avgExperience: { $avg: '$yearsOfExperience' },
          minExperience: { $min: '$yearsOfExperience' },
          maxExperience: { $max: '$yearsOfExperience' }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $project: {
          jobId: '$_id',
          title: '$job.title',
          avgExperience: { $round: ['$avgExperience', 1] },
          minExperience: 1,
          maxExperience: 1
        }
      },
      { $sort: { avgExperience: -1 } }
    ]);

    res.json({
      totalApplicants: uniqueApplicants.length,
      perJobCounts,
      statusDistribution: statusMap,
      avgExperiencePerJob
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;