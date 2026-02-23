import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
import { getCachedUser, cacheUser, getCachedRoomMessages, cacheRoomMessages, } from '../utils/redis.js';
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const activeConnections = new Map();
class ChatService {
    async getOrCreateRoom(name) {
        const room = await prisma.room.upsert({
            where: { name },
            update: {},
            create: { name },
        });
        return room;
    }
    async getRooms() {
        return prisma.room.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async addUser(connectionId, userId, roomName = 'general') {
        // only authenticated users may join rooms; userId must reference an existing user
        const room = await this.getOrCreateRoom(roomName);
        const user = await prisma.user.update({
            where: { id: userId },
            data: { roomId: room.id },
        });
        activeConnections.set(connectionId, user.id);
        return user;
    }
    async removeUser(connectionId) {
        const userId = activeConnections.get(connectionId);
        if (!userId)
            return undefined;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        activeConnections.delete(connectionId);
        return user;
    }
    async getUser(connectionId) {
        const userId = activeConnections.get(connectionId);
        if (!userId)
            return undefined;
        return prisma.user.findUnique({
            where: { id: userId },
        });
    }
    async addMessage(text, userId, roomId) {
        const message = await prisma.message.create({
            data: {
                text,
                userId,
                roomId,
            },
            include: {
                user: true,
            },
        });
        // After adding a message, update the cache for this room
        const recentMessages = await prisma.message.findMany({
            where: { roomId },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        await cacheRoomMessages(roomId, recentMessages);
        return message;
    }
    async getMessages(roomId, limit = 50) {
        // Try cache first
        const cached = await getCachedRoomMessages(roomId);
        if (cached)
            return cached.slice(0, limit);
        const messages = await prisma.message.findMany({
            where: { roomId },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        await cacheRoomMessages(roomId, messages);
        return messages;
    }
    async getUserById(userId) {
        // Try cache first
        const cached = await getCachedUser(userId);
        if (cached)
            return cached;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user)
            await cacheUser(userId, user);
        return user;
    }
}
export const chatService = new ChatService();
//# sourceMappingURL=chatService.js.map