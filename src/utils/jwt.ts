import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email?: string;
  role: string
  
}

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET is not set in environment variables');
}
const JWT_SECRET: string  = secret;
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '1h';

export function generateToken(payload: JWTPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN});
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}