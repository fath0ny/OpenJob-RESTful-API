import { Router } from 'express';
import {
  createBookmark, getBookmarkById, getMyBookmarks, deleteBookmark,
} from '../controller/bookmark-controller.js';
import authenticateToken from '../../../middlewares/auth.js';

const router = Router();

router.post('/jobs/:jobId/bookmark', authenticateToken, createBookmark);
router.get('/jobs/:jobId/bookmark/:id', authenticateToken, getBookmarkById);
router.delete('/jobs/:jobId/bookmark', authenticateToken, deleteBookmark);
router.get('/bookmarks', authenticateToken, getMyBookmarks);

export default router;