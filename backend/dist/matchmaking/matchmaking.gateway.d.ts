import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { SocketEvents } from 'src/socket/socketEvents';
import { RoomsService } from 'src/rooms/services/rooms/rooms.service';
export declare class MatchMakingGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly roomsService;
    private readonly socketEvents;
    server: Server;
    afterInit(server: Server): void;
    private readonly MMSocket;
    private mmQueue;
    private mm;
    constructor(roomsService: RoomsService, socketEvents: SocketEvents);
    emitbackplayer2id(id1: number, id2: number): Promise<{
        roomName: string;
        Capacity: string;
        private: boolean;
        uid: string;
    } | undefined>;
    catchresolver(players: any): void;
    runGame(players: any): void;
    getPlayerStateMM(id: number): import("./customMM/matchMaker").IPlayerState;
    wait(milliseconds: any): Promise<unknown>;
    getKey(player: any): any;
    handleConnection(client: Socket): Promise<void>;
    queuein(socket: Readonly<any>): Promise<void>;
    queueout(socket: Readonly<any>): false | undefined;
    accept(socket: Readonly<any>): Promise<void>;
    decline(socket: Readonly<any>): void;
    endGame(socket: Readonly<any>): void;
    handleDisconnect(socket: Readonly<any>): void;
}
