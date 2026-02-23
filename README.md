# A Real Time Chatting System API

A real-time chat application backend with WebSocket support and REST API.

## Features

- ✅ Real-time messaging via WebSocket
- ✅ Multiple chat rooms
- ✅ User management (join, leave, list)
- ✅ Message history (in-memory)
- ✅ REST API for rooms, users, messages
- ✅ TypeScript with proper typing

## Project Structure

```
src/
├── app.ts                    # Express app setup
├── server.ts                 # Entry point
├── config/
│   └── index.ts              # Environment config
├── types/
│   └── index.ts              # TypeScript interfaces
├── services/
│   └── chatService.ts        # Business logic
├── websockets/
│   ├── index.ts              # WebSocket server setup
│   └── handlers/
│       ├── connectionHandler.ts
│       └── messageHandler.ts
├── controllers/
│   ├── chatController.ts
│   └── roomController.ts
├── routes/
│   ├── index.ts
│   ├── chatRoutes.ts
│   └── roomRoutes.ts
└── middlewares/
    └── index.ts
```

## Running the Server

```bash
npm install
npm run dev
```

## REST API Endpoints

### Health
- `GET /api/v1/health` - Server health check

### Rooms
- `GET /api/v1/rooms` - Get all rooms
- `GET /api/v1/rooms/:roomId` - Get room with users
- `POST /api/v1/rooms` - Create room `{ "name": "Room Name" }`

### Chat
- `GET /api/v1/chat/messages/:roomId` - Get message history
- `GET /api/v1/chat/users` - Get all online users
- `GET /api/v1/chat/users/:roomId` - Get users in room

## WebSocket Protocol

### Connect
```
ws://localhost:3000
```

### Client → Server Messages

**Join Chat:**
```json
{ "type": "join", "username": "Alice", "roomId": "general" }
```

**Send Message:**
```json
{ "type": "message", "text": "Hello everyone!" }
```

**Join Room:**
```json
{ "type": "join_room", "roomId": "random" }
```

**Create Room:**
```json
{ "type": "create_room", "roomName": "My Room" }
```

**Typing Indicator:**
```json
{ "type": "typing" }
```

### Server → Client Messages

**System Message:**
```json
{ "type": "system", "text": "Alice joined the chat" }
```

**Chat Message:**
```json
{ "type": "message", "username": "Alice", "text": "Hello!", "roomId": "general", "timestamp": "..." }
```

**User List:**
```json
{ "type": "user_list", "data": [...], "roomId": "general" }
```

**Room List:**
```json
{ "type": "room_list", "data": [...] }
```

**Message History:**
```json
{ "type": "history", "data": [...], "roomId": "general" }
```

**Error:**
```json
{ "type": "error", "text": "Error message" }
```

## Testing with curl

```bash
# Get all rooms
curl http://localhost:3000/api/v1/rooms

# Create a room
curl -X POST http://localhost:3000/api/v1/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "Random"}'

# Get messages in a room
curl http://localhost:3000/api/v1/chat/messages/general

# Get users in a room
curl http://localhost:3000/api/v1/chat/users/general
```

## Next Steps

- [ ] Add database persistence (SQLite/PostgreSQL)
- [ ] Add authentication (JWT)
- [ ] Add private messaging
- [ ] Add file uploads
- [ ] Add rate limiting
