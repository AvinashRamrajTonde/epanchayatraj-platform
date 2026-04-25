import { Router } from 'express';
import { login, refreshToken, getProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../utils/validators.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.get('/profile', authenticate, getProfile);

export default router;
