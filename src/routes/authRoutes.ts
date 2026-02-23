import {
	loginUser,
	registerUser,
	getMe,
} from '../controllers/authController.js';
import { Router } from 'express';
import { authRateLimiter } from '../middlewares/rate-limit.middleware.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', authRateLimiter, registerUser);
router.post('/login', authRateLimiter, loginUser);
router.get('/me', authenticateJWT, getMe);

export default router;
