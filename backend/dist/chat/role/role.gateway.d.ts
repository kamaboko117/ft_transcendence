import { Server } from 'socket.io';
import { ChatGateway } from '../chat.gateway';
export declare class RoleGateway {
    private chatGateway;
    server: Server;
    afterInit(server: Server): void;
    constructor(chatGateway: ChatGateway);
    emitToRoom(id: string, user_id: number, username: string, avatar_path: string, emit_name: string): void;
    actionOnUser(id: string, user_id: number, username: string, avatar_path: string, emit_name: string): void;
    updateListChat(id: string): void;
}
