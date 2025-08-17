import { Router, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types';
import { authGuard } from '../middleware/auth';

const router = Router();

// Get current user
router.get('/me', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update current user profile
router.patch('/me', authGuard, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, resumeUrl } = req.body;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (resumeUrl && req.user?.role === 'applicant') updateData.resumeUrl = resumeUrl;

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;