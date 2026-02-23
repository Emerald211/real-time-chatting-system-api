import type { Request, Response } from 'express';
export declare const getRooms: (_req: Request, res: Response) => Promise<void>;
export declare const getRoomMessages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createRoom: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=roomController.d.ts.map