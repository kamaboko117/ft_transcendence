"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomMM = void 0;
const matchMaker_1 = require("./matchMaker");
class CustomMM extends matchMaker_1.Matchmaker {
    constructor(resolver, getKey, mgateway, options) {
        super(resolver, getKey, mgateway, options);
        this.FifoMatch = () => {
            let players;
            while (this.queue.length >= this.minMatchSize) {
                players = [];
                while (this.queue.length > 0 && players.length < this.maxMatchSize) {
                    players.push(this.queue.pop());
                }
                this.resolver(players);
            }
        };
        setInterval(this.FifoMatch, this.checkInterval);
    }
}
exports.CustomMM = CustomMM;
//# sourceMappingURL=customMM.js.map