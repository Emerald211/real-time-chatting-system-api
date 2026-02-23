import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: redisUrl });

// Separate client for pub/sub
const redisSubscriber = createClient({ url: redisUrl });

redisSubscriber.on('error', (err) =>
	console.error('Redis Subscriber Error', err),
);

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export async function connectRedis() {
	if (!redisClient.isOpen) await redisClient.connect();
	if (!redisSubscriber.isOpen) await redisSubscriber.connect();
}

export async function addUserToRoom(roomId: string, userId: string) {
	await connectRedis();
	await redisClient.sAdd(`online:room:${roomId}`, userId);
	const members = await redisClient.sMembers(`online:room:${roomId}`);
	console.log(
		`[Presence] addUserToRoom: room=${roomId}, user=${userId}, nowOnline=[${members.join(', ')}]`,
	);
}

export async function removeUserFromRoom(roomId: string, userId: string) {
	await connectRedis();
	await redisClient.sRem(`online:room:${roomId}`, userId);
	const members = await redisClient.sMembers(`online:room:${roomId}`);
	console.log(
		`[Presence] removeUserFromRoom: room=${roomId}, user=${userId}, nowOnline=[${members.join(', ')}]`,
	);
}

export async function getOnlineUsers(roomId: string): Promise<string[]> {
	await connectRedis();
	return await redisClient.sMembers(`online:room:${roomId}`);
}

export async function isRateLimited(
	key: string,
	limit: number,
	windowSec: number,
): Promise<boolean> {
	await connectRedis();
	const count = await redisClient.incr(key);
	if (count === 1) {
		await redisClient.expire(key, windowSec);
	}
	return count > limit;
}

// Caching recent messages per room
export async function cacheRoomMessages(
	roomId: string,
	messages: any[],
	ttlSec = 30,
) {
	await connectRedis();
	const key = `cache:messages:room:${roomId}`;
	await redisClient.set(key, JSON.stringify(messages), { EX: ttlSec });
}

export async function getCachedRoomMessages(
	roomId: string,
): Promise<any[] | null> {
	await connectRedis();
	const key = `cache:messages:room:${roomId}`;
	const data = await redisClient.get(key);
	return data ? JSON.parse(data) : null;
}

// Caching user data
export async function cacheUser(userId: string, user: any, ttlSec = 60) {
	await connectRedis();
	const key = `cache:user:${userId}`;
	await redisClient.set(key, JSON.stringify(user), { EX: ttlSec });
}

export async function getCachedUser(userId: string): Promise<any | null> {
	await connectRedis();
	const key = `cache:user:${userId}`;
	const data = await redisClient.get(key);
	return data ? JSON.parse(data) : null;
}

// --- Pub/Sub utilities ---
export async function publishToChannel(channel: string, message: any) {
	await connectRedis();
	await redisClient.publish(channel, JSON.stringify(message));
}

export async function subscribeToChannel(
	channel: string,
	handler: (msg: any) => void,
) {
	await connectRedis();
	await redisSubscriber.subscribe(channel, (message) => {
		try {
			handler(JSON.parse(message));
		} catch {
			handler(message);
		}
	});
}

export default redisClient;
