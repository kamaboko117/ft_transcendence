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
exports.Channel = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../typeorm/user.entity");
const lstmsg_entity_1 = require("./lstmsg.entity");
const lstuser_entity_1 = require("./lstuser.entity");
const lstmute_entity_1 = require("./lstmute.entity");
const lstban_entity_1 = require("./lstban.entity");
let Channel = class Channel {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Channel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Channel.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Channel.prototype, "accesstype", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Channel.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.lstChannel, { nullable: true, cascade: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Channel.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Channel.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lstmsg_entity_1.ListMsg, (listmsg) => listmsg.chat),
    __metadata("design:type", Array)
], Channel.prototype, "lstMsg", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lstuser_entity_1.ListUser, (listuser) => listuser.chat),
    __metadata("design:type", Array)
], Channel.prototype, "lstUsr", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lstmute_entity_1.ListMute, (listmute) => listmute.chat),
    __metadata("design:type", Array)
], Channel.prototype, "lstMute", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lstban_entity_1.ListBan, (listban) => listban.chat),
    __metadata("design:type", Array)
], Channel.prototype, "lstBan", void 0);
Channel = __decorate([
    (0, typeorm_1.Entity)()
], Channel);
exports.Channel = Channel;
//# sourceMappingURL=chat.entity.js.map