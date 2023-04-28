import { Matchmaker, IMatchMakerOptions } from './matchMaker';
import { MatchMakingGateway } from '../matchmaking.gateway';
interface ICustomMMOptions extends IMatchMakerOptions {
}
export declare class CustomMM<P> extends Matchmaker<P> {
    constructor(resolver: (players: P[]) => void, getKey: (player: P) => string, mgateway: MatchMakingGateway, options?: ICustomMMOptions);
    private FifoMatch;
}
export {};
