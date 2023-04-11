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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const chat_entity_1 = require("../chat/chat.entity");
const lstmsg_entity_1 = require("../chat/lstmsg.entity");
const lstuser_entity_1 = require("../chat/lstuser.entity");
const lstban_entity_1 = require("../chat/lstban.entity");
const lstmute_entity_1 = require("../chat/lstmute.entity");
const blackFriendList_entity_1 = require("./blackFriendList.entity");
const stat_entity_1 = require("./stat.entity");
const matchHistory_entity_1 = require("./matchHistory.entity");
let User = class User {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'user_id',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], User.prototype, "userID", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
        default: '',
    }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatarPath", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
        default: '',
    }),
    __metadata("design:type", String)
], User.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "fa", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], User.prototype, "secret_fa", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "fa_first_entry", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
    }),
    __metadata("design:type", String)
], User.prototype, "fa_psw", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_entity_1.Channel, (listchannel) => listchannel.user),
    __metadata("design:type", Array)
], User.prototype, "lstChannel", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lstmsg_entity_1.ListMsg, (listMsg) => listMsg.user),
    __metadata("design:type", Array)
], User.prototype, "lstMsg", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lstuser_entity_1.ListUser, (listUsr) => listUsr.user),
    __metadata("design:type", Array)
], User.prototype, "lstUsr", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lstban_entity_1.ListBan, (listBan) => listBan.user),
    __metadata("design:type", Array)
], User.prototype, "lstBan", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lstmute_entity_1.ListMute, (listMute) => listMute.user),
    __metadata("design:type", Array)
], User.prototype, "lstMute", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => blackFriendList_entity_1.BlackFriendList, (blackfriendlist) => blackfriendlist.owner_id),
    __metadata("design:type", Array)
], User.prototype, "lstBlackFriendOwner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => blackFriendList_entity_1.BlackFriendList, (blackfriendlist) => blackfriendlist.userFocus),
    __metadata("design:type", Array)
], User.prototype, "lstBlackFriendFocus", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => stat_entity_1.Stat, (stat) => stat.user),
    __metadata("design:type", Array)
], User.prototype, "sstat", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => matchHistory_entity_1.MatchHistory, (matchhistory) => matchhistory.MP1),
    __metadata("design:type", Array)
], User.prototype, "matchPlayerOne", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => matchHistory_entity_1.MatchHistory, (matchhistory) => matchhistory.MP2),
    __metadata("design:type", Array)
], User.prototype, "matchPlayerTwo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => matchHistory_entity_1.MatchHistory, (matchhistory) => matchhistory.victory_user),
    __metadata("design:type", Array)
], User.prototype, "userVictory", void 0);
User = __decorate([
    (0, typeorm_1.Entity)()
], User);
exports.User = User;
//# sourceMappingURL=user.entity.js.map