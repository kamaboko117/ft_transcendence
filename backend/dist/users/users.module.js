"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const users_controller_1 = require("./controllers/users/users.controller");
const users_service_1 = require("./providers/users/users.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("../typeorm");
const stat_entity_1 = require("../typeorm/stat.entity");
const blackFriendList_entity_1 = require("../typeorm/blackFriendList.entity");
const auth_module_1 = require("../auth/auth.module");
const users_gateway_1 = require("./providers/users/users.gateway");
const matchHistory_entity_1 = require("../typeorm/matchHistory.entity");
let UsersModule = class UsersModule {
};
UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => auth_module_1.AuthModule), typeorm_1.TypeOrmModule.forFeature([typeorm_2.User, blackFriendList_entity_1.BlackFriendList, stat_entity_1.Stat, matchHistory_entity_1.MatchHistory])],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService, users_gateway_1.UsersGateway],
        exports: [users_service_1.UsersService, users_gateway_1.UsersGateway]
    })
], UsersModule);
exports.UsersModule = UsersModule;
//# sourceMappingURL=users.module.js.map