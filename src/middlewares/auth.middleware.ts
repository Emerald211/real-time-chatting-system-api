import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';

export interface AuthenticatedRequest extends Request {
	user?: ReturnType<typeof verifyToken>;
}

export function authenticateJWT(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers.authorization;
	const token =
		typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
			? authHeader.split(' ')[1]
			: undefined;
	if (!token) {
		return res
			.status(401)
			.json({ message: 'Missing or invalid Authorization header' });
	}
	try {
		const payload = verifyToken(token);
		req.user = payload;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
}


export const roleAuthorization = (...roles: String[]) => {
	return(req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		next();
	};
};