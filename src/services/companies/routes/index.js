import { Router } from 'express';
import {
  createCompany, getCompanies, getCompanyById, editCompanyById, deleteCompanyById,
} from '../controller/company-controller.js';
import { validate } from '../../../middlewares/validate.js';
import authenticateToken from '../../../middlewares/auth.js';
import { companyPayloadSchema } from '../validator/schema.js';

const router = Router();

router.get('/companies', getCompanies);
router.get('/companies/:id', getCompanyById);
router.post('/companies', authenticateToken, validate(companyPayloadSchema), createCompany);
router.put('/companies/:id', authenticateToken, validate(companyPayloadSchema), editCompanyById);
router.delete('/companies/:id', authenticateToken, deleteCompanyById);

export default router;