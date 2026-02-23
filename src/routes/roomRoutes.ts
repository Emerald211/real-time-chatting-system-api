import { Router } from 'express';
import {
	getRooms,
	getRoomMessages,
	createRoom,
} from '../controllers/roomController.js';
import { authenticateJWT, roleAuthorization } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticateJWT, getRooms);
router.get('/:roomName/messages', authenticateJWT, getRoomMessages);
router.post('/', authenticateJWT, createRoom);
router.delete('/:roomName', authenticateJWT, roleAuthorization('ADMIN'), )

export default router;
