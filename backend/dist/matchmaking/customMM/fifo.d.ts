import { Matchmaker, IMatchMakerOptions } from './matchMaker';
interface IFifoMatchMakerOptions extends IMatchMakerOptions {
}
export declare class FifoMatchmaker<P> extends Matchmaker<P> {
    constructor(resolver: (players: P[]) => void, getKey: (player: P) => string, options?: IFifoMatchMakerOptions);
    private FifoMatch;
}
export {};
