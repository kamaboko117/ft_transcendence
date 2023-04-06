import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { DataSource } from 'typeorm';
import { Channel } from './chat.entity';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from './chat.service';
declare class Room {
    id: string;
    psw: string;
}
declare class SendMsg {
    id: string;
    username: string;
    content: string;
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private dataSource;
    private authService;
    private chatService;
    server: Server;
    private chatsRepository;
    private listUserRepository;
    private listMsgRepository;
    private readonly mapSocket;
    constructor(dataSource: DataSource, authService: AuthService, chatService: ChatService);
    getMap(): Map<string, string>;
    joinRoomChat(socket: Readonly<any>, data: Room): Promise<boolean | {
        ban: boolean;
    }>;
    searchAndSetAdministratorsChannel(id: string): Promise<void>;
    setNewOwner(userId: number, id: string, ownerId: string): Promise<Channel | null | undefined>;
    leaveRoomChat(socket: Readonly<any>, data: Room): Promise<string | undefined | {
        ban: boolean;
    }>;
    stopEmit(socket: Readonly<any>, data: any): Promise<{
        ban: boolean;
    } | undefined>;
    newPostChat(socket: any, data: SendMsg): Promise<{
        room: string;
        user_id: any;
        user: {
            username: any;
            avatarPath: any;
        };
        content: string;
    } | undefined>;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
}
export {};
