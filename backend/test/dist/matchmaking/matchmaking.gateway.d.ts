import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MatchMakingService } from './matchmaking.services';
export declare class MatchMakingGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly MMService;
    server: Server;
    afterInit(server: Server): void;
    constructor(MMService: MatchMakingService);
    handleConnection(client: Socket): Promise<void>;
    queuein(socket: Readonly<any>): Promise<false | {
        event: string;
        room: string;
    }>;
    queueout(socket: Readonly<any>): false | undefined;
    accept(socket: Readonly<any>): Promise<void>;
    decline(socket: Readonly<any>): void;
    handleDisconnect(socket: Readonly<any>): void;
}
