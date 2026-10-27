import { Router } from 'express';
import {
  getProfile, getMyApplications, getMyBookmarks,
} from '../controller/profile-controller.js';
import authenticateToken from '../../../middlewares/auth.js';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.get('/profile/applications', authenticateToken, getMyApplications);
router.get('/profile/bookmarks', authenticateToken, getMyBookmarks);

export default router;