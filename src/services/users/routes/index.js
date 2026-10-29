import { Router } from 'express';
import { createUser, getUserById, editUserById } from '../controller/user-controller.js';
import { validate } from '../../../middlewares/validate.js';
import authenticateToken from '../../../middlewares/auth.js';
import { userPayloadSchema, userUpdatePayloadSchema } from '../validator/schema.js';

const router = Router();

router.post('/users', validate(userPayloadSchema), createUser);
router.get('/users/:id', getUserById);
router.put('/users/:id', authenticateToken, validate(userUpdatePayloadSchema), editUserById);

export default router;