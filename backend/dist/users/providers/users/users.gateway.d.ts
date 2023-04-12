import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
declare class Info {
    userId: number;
}
export declare class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private authService;
    server: Server;
    private readonly mapSocket;
    constructor(authService: AuthService);
    getStatusUser(data: Info): {
        code: number;
    };
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    getMap(): Map<string, string>;
}
export {};
