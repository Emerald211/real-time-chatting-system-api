import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
export interface AuthenticatedRequest extends Request {
    user?: ReturnType<typeof verifyToken>;
}
export declare function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map