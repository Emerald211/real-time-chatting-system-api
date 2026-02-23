import type { Request, Response } from 'express';
import { chatService } from '../services/chatService.js';

export const getRooms = async (_req: Request, res: Response) => {
	try {
		const rooms = await chatService.getRooms();
		res.json(rooms);
	} catch (error) {
		console.error('Error fetching rooms:', error);
		res.status(500).json({ error: 'Failed to fetch rooms' });
	}
};

export const getRoomMessages = async (req: Request, res: Response) => {
	const param = req.params.roomName;
	const roomName = Array.isArray(param) ? param[0] : param;

	if (typeof roomName !== 'string' || roomName.trim() === '') {
		return res.status(400).json({ error: 'Invalid room name' });
	}

	const room = await chatService.getOrCreateRoom(roomName);
	if (!room) {
		return res.status(404).json({ error: 'Room not found' });
	}

	try {
		const roomMessages = await chatService.getMessages(room.id);
		res.json(roomMessages);
	} catch (error) {
		console.error('Error fetching messages:', error);
		res.status(500).json({ error: 'Failed to fetch messages' });
	}
};

export const createRoom = async (req: Request, res: Response) => {
	const { name } = req.body;
	if (!name || typeof name !== 'string' || name.trim() === '') {
		return res.status(400).json({ error: 'Room name is required' });
	}
	try {
		const room = await chatService.getOrCreateRoom(name.trim());
		return res.status(201).json(room);
	} catch (error) {
		console.error('Error creating room:', error);
		return res.status(500).json({ error: 'Failed to create room' });
	}
};

export const deleteRoom = async (req: Request, res: Response) => {
	const param = req.params.roomName;
	const roomName = Array.isArray(param) ? param[0] : param;

	if (typeof roomName !== 'string' || roomName.trim() === '') {
		return res.status(400).json({ error: 'Invalid room name' });
	}

	const room = await chatService.getOrCreateRoom(roomName);
	if (!room) {
		return res.status(404).json({ error: 'Room not found' });
	}

	try {
		await chatService.deleteRoom(room.id);
		res.status(204).send();
	} catch (error) {
		console.error('Error deleting room:', error);
		res.status(500).json({ error: 'Failed to delete room' });
	}
};