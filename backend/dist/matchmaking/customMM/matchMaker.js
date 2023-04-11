"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Matchmaker = exports.IPlayerState = void 0;
let errorMessages = {
    playerInQueue: "Player is already in queue",
    playerNotInQueue: "Player is not in queue",
    playerNotInGame: "Player is not in game",
    gameDoesNotExists: "Game does not exists"
};
var IPlayerState;
(function (IPlayerState) {
    IPlayerState[IPlayerState["NONE"] = 0] = "NONE";
    IPlayerState[IPlayerState["INQUEUE"] = 1] = "INQUEUE";
    IPlayerState[IPlayerState["PLAYING"] = 2] = "PLAYING";
})(IPlayerState = exports.IPlayerState || (exports.IPlayerState = {}));
class Matchmaker {
    get playersInQueue() {
        return this.queue.length;
    }
    constructor(resolver, getKey, options) {
        this.push = (player) => {
            if (this.indexOnQueue(player) != -1)
                throw Error(errorMessages.playerInQueue);
            this.queue.push(player);
        };
        this.indexOnQueue = (player) => {
            let playerKey = this.getKey(player);
            let index;
            index = this.queue.findIndex((player) => { return this.getKey(player) == playerKey; });
            return index;
        };
        this.resolver = (players) => {
            this.inGame.push({ players, id: this.nextGameId++ });
            resolver(players);
        };
        this.getKey = getKey;
        this.queue = [];
        this.inGame = [];
        this.nextGameId = Number.MIN_SAFE_INTEGER;
        this.checkInterval = (options && options.checkInterval && options.checkInterval > 0 && options.checkInterval) || 5000;
        this.maxMatchSize = (options && options.maxMatchSize && options.maxMatchSize > 0 && options.maxMatchSize) || 2;
        this.minMatchSize = (options && options.minMatchSize && options.minMatchSize > 0 && options.minMatchSize) || this.maxMatchSize;
    }
    getPlayerState(player) {
        let playerKey = this.getKey(player);
        if (this.queue.find((queuePlayer) => playerKey == this.getKey(queuePlayer))) {
            return IPlayerState.INQUEUE;
        }
        else if (this.inGame.find((game) => { return game.players.find((gamePlayer) => playerKey == this.getKey(gamePlayer)); })) {
            return IPlayerState.PLAYING;
        }
        return IPlayerState.NONE;
    }
    leaveQueue(player) {
        let index = this.indexOnQueue(player);
        if (index == -1)
            throw Error(errorMessages.playerNotInQueue);
        this.queue.splice(index, 1);
    }
    endGame(players) {
        players = (players instanceof Array) ? players : [players];
        let gameIndex = -1;
        for (let player of players) {
            let playerKey = this.getKey(player);
            gameIndex = this.inGame.findIndex((game) => { return game.players.find((gamePlayer) => playerKey == this.getKey(gamePlayer)); });
            if (gameIndex != -1) {
                break;
            }
        }
        if (gameIndex == -1)
            throw Error(errorMessages.gameDoesNotExists);
        this.inGame.splice(gameIndex, 1);
    }
}
exports.Matchmaker = Matchmaker;
//# sourceMappingURL=matchMaker.js.map