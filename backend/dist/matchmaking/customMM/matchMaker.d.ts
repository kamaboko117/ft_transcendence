export declare enum IPlayerState {
    NONE = 0,
    INQUEUE = 1,
    PLAYING = 2
}
export interface IMatchMakerOptions {
    checkInterval?: number;
    maxMatchSize?: number;
    minMatchSize?: number;
}
interface Game<P> {
    players: P[];
    id: number;
}
export declare class Matchmaker<P> {
    protected resolver: (players: P[]) => void;
    protected getKey: (player: P) => string;
    protected queue: P[];
    protected inGame: Game<P>[];
    private nextGameId;
    protected checkInterval: number;
    protected maxMatchSize: number;
    protected minMatchSize: number;
    get playersInQueue(): number;
    constructor(resolver: (players: P[]) => void, getKey: (player: P) => string, options?: IMatchMakerOptions);
    push: (player: P) => void;
    getPlayerState(player: P): IPlayerState;
    leaveQueue(player: P): void;
    endGame(players: P | P[]): void;
    indexOnQueue: (player: P) => number;
}
export {};
