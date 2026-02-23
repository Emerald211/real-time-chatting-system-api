import { Router } from 'express';
import { getRooms, getRoomMessages, createRoom, } from '../controllers/roomController.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
const router = Router();
router.get('/', authenticateJWT, getRooms);
router.get('/:roomName/messages', authenticateJWT, getRoomMessages);
router.post('/', authenticateJWT, createRoom);
export default router;
//# sourceMappingURL=roomRoutes.js.map