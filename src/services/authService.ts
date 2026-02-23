import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
import type { RegisterUserDto } from '../dtos/registerUserDto.js';
import * as bcrypt from 'bcrypt';
import type { LoginDto } from '../dtos/loginDto.js';

class AuthService {
	private prisma = new PrismaClient({ adapter });
	async registerUser(dto: RegisterUserDto) {
		const { username, password, email, role } = dto;

		// ensure there is a default room to attach new users to (schema requires room)
		const defaultRoom = await this.prisma.room.upsert({
			where: { name: 'general' },
			update: {},
			create: { name: 'general' },
		});

		const existingUser = await this.prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			throw new Error('Email already in use');
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await this.prisma.user.create({
			data: {
				username,
				password: hashedPassword,
				email,
				room: { connect: { id: defaultRoom.id } },
				role: role || 'USER',
			},
		});
		return newUser;
	}

	async loginUser(dto: LoginDto) {
		const { email, password } = dto;

		const user = await this.prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			throw new Error('Invalid email or password');
		}

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			throw new Error('Invalid email or password');
		}

		return user;
	}

	async getMe(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, username: true, roomId: true },
		});
		return user;
	}
}

export default new AuthService();
