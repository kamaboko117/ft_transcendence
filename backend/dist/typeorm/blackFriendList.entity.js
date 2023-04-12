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
exports.BlackFriendList = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let BlackFriendList = class BlackFriendList {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BlackFriendList.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
    }),
    __metadata("design:type", Number)
], BlackFriendList.prototype, "type_list", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.lstBlackFriendOwner, { nullable: false, cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'owner_id' }),
    __metadata("design:type", user_entity_1.User)
], BlackFriendList.prototype, "userOwner", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], BlackFriendList.prototype, "owner_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.lstBlackFriendFocus, { nullable: false, cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'focus_id' }),
    __metadata("design:type", user_entity_1.User)
], BlackFriendList.prototype, "userFocus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], BlackFriendList.prototype, "focus_id", void 0);
BlackFriendList = __decorate([
    (0, typeorm_1.Entity)()
], BlackFriendList);
exports.BlackFriendList = BlackFriendList;
//# sourceMappingURL=blackFriendList.entity.js.map