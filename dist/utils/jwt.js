import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('JWT_SECRET is not set in environment variables');
}
const JWT_SECRET = secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
//# sourceMappingURL=jwt.js.map