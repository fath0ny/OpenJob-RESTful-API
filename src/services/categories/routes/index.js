import { Router } from 'express';
import {
  createCategory, getCategories, getCategoryById, editCategoryById, deleteCategoryById,
} from '../controller/category-controller.js';
import { validate } from '../../../middlewares/validate.js';
import authenticateToken from '../../../middlewares/auth.js';
import { categoryPayloadSchema } from '../validator/schema.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', authenticateToken, validate(categoryPayloadSchema), createCategory);
router.put('/categories/:id', authenticateToken, validate(categoryPayloadSchema), editCategoryById);
router.delete('/categories/:id', authenticateToken, deleteCategoryById);

export default router;