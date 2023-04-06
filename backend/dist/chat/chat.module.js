"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chat_gateway_1 = require("./chat.gateway");
const role_service_1 = require("./role/role.service");
const chat_controller_1 = require("./chat.controller");
const chat_entity_1 = require("./chat.entity");
const lstmsg_entity_1 = require("./lstmsg.entity");
const lstuser_entity_1 = require("./lstuser.entity");
const lstmute_entity_1 = require("./lstmute.entity");
const lstban_entity_1 = require("./lstban.entity");
const users_module_1 = require("../users/users.module");
const role_controller_1 = require("./role/role.controller");
const role_gateway_1 = require("./role/role.gateway");
const blackFriendList_entity_1 = require("../typeorm/blackFriendList.entity");
const chat_service_1 = require("./chat.service");
let ChatModule = class ChatModule {
};
ChatModule = __decorate([
    (0, common_1.Module)({
        providers: [chat_service_1.ChatService, chat_gateway_1.ChatGateway, role_service_1.RoleService, role_gateway_1.RoleGateway],
        imports: [typeorm_1.TypeOrmModule.forFeature([chat_entity_1.Channel, lstmsg_entity_1.ListMsg,
                lstuser_entity_1.ListUser, lstmute_entity_1.ListMute, lstban_entity_1.ListBan, blackFriendList_entity_1.BlackFriendList]), users_module_1.UsersModule],
        exports: [chat_gateway_1.ChatGateway],
        controllers: [chat_controller_1.ChatController, role_controller_1.RoleController]
    })
], ChatModule);
exports.ChatModule = ChatModule;
//# sourceMappingURL=chat.module.js.map