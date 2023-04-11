import { Matchmaker, IMatchMakerOptions } from './matchMaker';
import { MatchMakingGateway } from '../matchmaking.gateway';
interface IFifoMatchMakerOptions extends IMatchMakerOptions {
}
export declare class FifoMatchmaker<P> extends Matchmaker<P> {
    constructor(resolver: (players: P[]) => void, getKey: (player: P) => string, mgateway: MatchMakingGateway, options?: IFifoMatchMakerOptions);
    private FifoMatch;
}
export {};
