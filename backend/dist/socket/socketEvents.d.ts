import { Server, Socket } from "socket.io";
import { UsersGateway } from "src/users/providers/users/users.gateway";
import { RoomsService } from "src/rooms/services/rooms/rooms.service";
import { Room } from "src/typeorm/room.entity";
export declare class SocketEvents {
    private userGateway;
    private readonly roomsService;
    constructor(userGateway: UsersGateway, roomsService: RoomsService);
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    isUserConnected(id: string): boolean;
    inviteUserToGame(userId: string, userIdFocus: string, idGame: string): void;
    MatchmakeUserToGame(userId: string, userIdFocus: string, idGame: string): void;
    private getSocketGameRoom;
    leave(data: any, client: Socket): void;
    checkIfUserFound(room: Room, clientId: string): boolean;
    join(data: any, client: Socket): Promise<void>;
    update(data: any, client: Socket): Promise<void>;
    updatePlayerPosition(data: any, client: Socket): Promise<void>;
}
