// A user in the chat
export interface User {
    id: string;
    username: string;
    roomId: string;
}

// A chat message
export interface Message {
    id: string;
    text: string;
    username: string;
    roomId: string;
    timestamp: Date;
}

// A chat room
export interface Room {
    id: string;
    name: string;
 
}