import { createClient } from 'redis';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: redisUrl });
// Separate client for pub/sub
const redisSubscriber = createClient({ url: redisUrl });
redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error', err));
redisClient.on('error', (err) => console.error('Redis Client Error', err));
export async function connectRedis() {
    if (!redisClient.isOpen)
        await redisClient.connect();
    if (!redisSubscriber.isOpen)
        await redisSubscriber.connect();
}
export async function addUserToRoom(roomId, userId) {
    await connectRedis();
    await redisClient.sAdd(`online:room:${roomId}`, userId);
}
export async function removeUserFromRoom(roomId, userId) {
    await connectRedis();
    await redisClient.sRem(`online:room:${roomId}`, userId);
}
export async function getOnlineUsers(roomId) {
    await connectRedis();
    return await redisClient.sMembers(`online:room:${roomId}`);
}
export async function isRateLimited(key, limit, windowSec) {
    await connectRedis();
    const count = await redisClient.incr(key);
    if (count === 1) {
        await redisClient.expire(key, windowSec);
    }
    return count > limit;
}
// Caching recent messages per room
export async function cacheRoomMessages(roomId, messages, ttlSec = 30) {
    await connectRedis();
    const key = `cache:messages:room:${roomId}`;
    await redisClient.set(key, JSON.stringify(messages), { EX: ttlSec });
}
export async function getCachedRoomMessages(roomId) {
    await connectRedis();
    const key = `cache:messages:room:${roomId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
}
// Caching user data
export async function cacheUser(userId, user, ttlSec = 60) {
    await connectRedis();
    const key = `cache:user:${userId}`;
    await redisClient.set(key, JSON.stringify(user), { EX: ttlSec });
}
export async function getCachedUser(userId) {
    await connectRedis();
    const key = `cache:user:${userId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
}
// --- Pub/Sub utilities ---
export async function publishToChannel(channel, message) {
    await connectRedis();
    await redisClient.publish(channel, JSON.stringify(message));
}
export async function subscribeToChannel(channel, handler) {
    await connectRedis();
    await redisSubscriber.subscribe(channel, (message) => {
        try {
            handler(JSON.parse(message));
        }
        catch {
            handler(message);
        }
    });
}
export default redisClient;
//# sourceMappingURL=redis.js.map