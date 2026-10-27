import { Router } from 'express';
import {
  createApplication, getApplications, getApplicationById, getApplicationsByUserId,
  getApplicationsByJobId, editApplicationStatus, deleteApplicationById,
} from '../controller/application-controller.js';
import { validate } from '../../../middlewares/validate.js';
import authenticateToken from '../../../middlewares/auth.js';
import { applicationPayloadSchema, applicationStatusPayloadSchema } from '../validator/schema.js';

const router = Router();

router.post('/applications', authenticateToken, validate(applicationPayloadSchema), createApplication);
router.get('/applications', authenticateToken, getApplications);
router.get('/applications/user/:userId', authenticateToken, getApplicationsByUserId);
router.get('/applications/job/:jobId', authenticateToken, getApplicationsByJobId);
router.get('/applications/:id', authenticateToken, getApplicationById);
router.put('/applications/:id', authenticateToken, validate(applicationStatusPayloadSchema), editApplicationStatus);
router.delete('/applications/:id', authenticateToken, deleteApplicationById);

export default router;