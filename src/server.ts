import app from './app.js';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { chatService } from './services/chatService.js';
import { verifyToken } from './utils/jwt.js';
import {
	addUserToRoom,
	removeUserFromRoom,
	getOnlineUsers,
	isRateLimited,
	publishToChannel,
	subscribeToChannel,
} from './utils/redis.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Track subscribed rooms to avoid duplicate subscriptions
const subscribedRooms = new Set<string>();

function broadcastToRoom(
	roomId: string,
	message: object,
	excludeWs?: WebSocket,
) {
	const messageStr = JSON.stringify(message);
	wss.clients.forEach((client) => {
		if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
			client.send(messageStr);
		}
	});
}

wss.on('connection', (ws) => {
	console.log('New client connected');
	const connectionId = Math.random().toString(36).substring(2, 9);

	ws.on('message', async (data) => {
		try {
			const message = JSON.parse(data.toString());
			console.log('Received:', message);
			switch (message.type) {
				case 'join': {
					const token = message.token;
					if (!token) {
						ws.send(
							JSON.stringify({
								type: 'error',
								message: 'Authentication token required to join room',
							}),
						);
						break;
					}
					let payload;
					try {
						payload = verifyToken(token);
					} catch {
						ws.send(
							JSON.stringify({
								type: 'error',
								message: 'Invalid or expired token',
							}),
						);
						break;
					}
					const userId = payload.userId;
					const user = await chatService.addUser(
						connectionId,
						userId,
						message.room || 'general',
					);
					await addUserToRoom(user.roomId, userId);
					// Dynamically subscribe to Redis channel for this room if not already
					if (!subscribedRooms.has(user.roomId)) {
						subscribeToChannel(`room:${user.roomId}`, (msg) => {
							broadcastToRoom(user.roomId, msg);
						});
						subscribedRooms.add(user.roomId);
					}
					const recentMessages = await chatService.getMessages(user.roomId);
					const onlineUserIds = await getOnlineUsers(user.roomId);
					const onlineUsers = await Promise.all(
						onlineUserIds.map(async (id) => {
							const u = await chatService.getUserById(id);
							return u ? u.username : id;
						}),
					);
					ws.send(
						JSON.stringify({
							type: 'welcome',
							user,
							messages: recentMessages.reverse(),
							onlineUsers,
						}),
					);
					broadcastToRoom(
						user.roomId,
						{ type: 'userJoined', username: user.username },
						ws,
					);
					break;
				}
				case 'message': {
					const user = await chatService.getUser(connectionId);
					if (!user) {
						ws.send(
							JSON.stringify({ type: 'error', message: 'Not logged in' }),
						);
						return;
					}
					const rateKey = `rate:user:${user.id}`;
					const isLimited = await isRateLimited(rateKey, 5, 10); // 5 messages per 10 seconds
					if (isLimited) {
						ws.send(
							JSON.stringify({
								type: 'error',
								message: 'Rate limit exceeded. Please wait.',
							}),
						);
						return;
					}
					const savedMessage = await chatService.addMessage(
						message.text,
						user.id,
						user.roomId,
					);
					// Publish the message to Redis channel for this room
					await publishToChannel(`room:${user.roomId}`, {
						type: 'message',
						id: savedMessage.id,
						text: savedMessage.text,
						username: savedMessage.user.username,
						timestamp: savedMessage.createdAt,
					});
					break;
				}
				case 'typing': {
					const user = await chatService.getUser(connectionId);
					if (!user) return;
					// Broadcast to all others in the same room
					broadcastToRoom(
						user.roomId,
						{
							type: 'typing',
							username: user.username,
							room: user.roomId,
						},
						ws,
					);
					break;
				}
				case 'getOnlineUsers': {
					const user = await chatService.getUser(connectionId);
					if (user) {
						const onlineUserIds = await getOnlineUsers(user.roomId);
						const onlineUsers = await Promise.all(
							onlineUserIds.map(async (id) => {
								const u = await chatService.getUserById(id);
								return u ? u.username : id;
							}),
						);
						ws.send(
							JSON.stringify({ type: 'onlineUsers', userIds: onlineUsers }),
						);
					}
					break;
				}
			}
		} catch (error) {
			console.error('Error handling message:', error);
			ws.send(
				JSON.stringify({ type: 'error', message: 'Invalid message format' }),
			);
		}
	});

	ws.on('close', async () => {
		const user = await chatService.getUser(connectionId);
		if (user) {
			await removeUserFromRoom(user.roomId, user.id);
			broadcastToRoom(user.roomId, {
				type: 'userLeft',
				username: user.username,
			});
		}
	});
});

server.listen(PORT, () => {
	console.log('Server running on http://localhost:' + PORT);
});
