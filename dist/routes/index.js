import { Router } from 'express';
import roomRoutes from './roomRoutes.js';
import authRoutes from './authRoutes.js';
import healthRoutes from './healthRoutes.js';
const router = Router();
router.use('/api/auth', authRoutes);
router.use('/api/rooms', roomRoutes);
router.use(healthRoutes);
export default router;
//# sourceMappingURL=index.js.map