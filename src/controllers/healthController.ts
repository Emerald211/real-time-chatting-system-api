import type { Request, Response } from 'express';
import authService from '../services/authService.js';

export const healthCheck = async (req: Request, res: Response) => {
	// Check DB connection
	try {
		await authService.getMe('00000000-0000-0000-0000-000000000000'); // Try a harmless query
		return res
			.status(200)
			.json({ status: 'ok', db: 'ok', timestamp: new Date().toISOString() });
	} catch (err) {
		return res.status(500).json({
			status: 'error',
			db: 'unreachable',
			timestamp: new Date().toISOString(),
		});
	}
};
