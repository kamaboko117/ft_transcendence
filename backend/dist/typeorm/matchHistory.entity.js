"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchHistory = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let MatchHistory = class MatchHistory {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MatchHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
    }),
    __metadata("design:type", String)
], MatchHistory.prototype, "type_game", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.matchPlayerOne, { nullable: false, cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'player_one' }),
    __metadata("design:type", user_entity_1.User)
], MatchHistory.prototype, "MP1", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], MatchHistory.prototype, "player_one", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.matchPlayerTwo, { nullable: false, cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'player_two' }),
    __metadata("design:type", user_entity_1.User)
], MatchHistory.prototype, "MP2", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], MatchHistory.prototype, "player_two", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.userVictory, { nullable: false, cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_victory' }),
    __metadata("design:type", user_entity_1.User)
], MatchHistory.prototype, "victory_user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], MatchHistory.prototype, "user_victory", void 0);
MatchHistory = __decorate([
    (0, typeorm_1.Entity)()
], MatchHistory);
exports.MatchHistory = MatchHistory;
//# sourceMappingURL=matchHistory.entity.js.map