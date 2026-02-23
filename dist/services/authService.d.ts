import type { RegisterUserDto } from '../dtos/registerUserDto.js';
import type { LoginDto } from '../dtos/loginDto.js';
declare class AuthService {
    private prisma;
    registerUser(dto: RegisterUserDto): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        username: string;
        password: string;
        roomId: string;
    }>;
    loginUser(dto: LoginDto): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        username: string;
        password: string;
        roomId: string;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        username: string;
        roomId: string;
    } | null>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=authService.d.ts.map