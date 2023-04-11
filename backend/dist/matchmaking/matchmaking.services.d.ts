import { TokenUser } from '../chat/chat.interface';
import { Server } from 'socket.io';
export declare class MatchMakingService {
    private mmQueue;
    private mm;
    runGame(players: any): void;
    constructor();
    private createMatch;
    queuein(user: TokenUser, socket: Readonly<any>, server: Server): void;
    queueout(user: TokenUser): void;
    acceptMatch(user: TokenUser): Promise<void>;
    declineMatch(user: TokenUser): void;
    private bothcheck;
}
