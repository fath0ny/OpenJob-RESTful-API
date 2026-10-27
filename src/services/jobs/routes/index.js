import { Router } from 'express';
import {
  createJob, getJobs, getJobById, getJobsByCompanyId, getJobsByCategoryId,
  editJobById, deleteJobById,
} from '../controller/job-controller.js';
import { validate, validateQuery } from '../../../middlewares/validate.js';
import authenticateToken from '../../../middlewares/auth.js';
import { jobPayloadSchema, jobQuerySchema } from '../validator/schema.js';

const router = Router();

router.get('/jobs', validateQuery(jobQuerySchema), getJobs);
router.get('/jobs/company/:companyId', getJobsByCompanyId);
router.get('/jobs/category/:categoryId', getJobsByCategoryId);
router.get('/jobs/:id', getJobById);
router.post('/jobs', authenticateToken, validate(jobPayloadSchema), createJob);
router.put('/jobs/:id', authenticateToken, validate(jobPayloadSchema), editJobById);
router.delete('/jobs/:id', authenticateToken, deleteJobById);

export default router;