import { verifyToken } from '../utils/jwt.js';
export function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
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
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}
//# sourceMappingURL=auth.middleware.js.map