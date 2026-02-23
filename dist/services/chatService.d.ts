declare class ChatService {
    getOrCreateRoom(name: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
    }>;
    getRooms(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
    }[]>;
    addUser(connectionId: string, userId: string, roomName?: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        username: string;
        password: string;
        roomId: string;
    }>;
    removeUser(connectionId: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        username: string;
        password: string;
        roomId: string;
    } | null | undefined>;
    getUser(connectionId: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        username: string;
        password: string;
        roomId: string;
    } | null | undefined>;
    addMessage(text: string, userId: string, roomId: string): Promise<{
        user: {
            id: string;
            createdAt: Date;
            email: string;
            username: string;
            password: string;
            roomId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        roomId: string;
        text: string;
        userId: string;
    }>;
    getMessages(roomId: string, limit?: number): Promise<any[]>;
    getUserById(userId: string): Promise<any>;
}
export declare const chatService: ChatService;
export {};
//# sourceMappingURL=chatService.d.ts.map