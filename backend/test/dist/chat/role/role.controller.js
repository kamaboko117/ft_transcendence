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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const common_1 = require("@nestjs/common");
const role_action_dto_1 = require("../dto/role-action-dto");
const role_service_1 = require("./role.service");
let RoleController = class RoleController {
    constructor(roleService) {
        this.roleService = roleService;
    }
    async getRole(userId, channelId) {
        if (!channelId || !userId)
            return ({ role: "", userId: undefined });
        const list_user = await this.roleService.getRole(channelId, userId);
        if (!list_user)
            return ({ role: "", userId: undefined });
        return ({ role: list_user.role, userId: list_user.user_id });
    }
    async getQueryRole(req, id) {
        const user = req.user;
        const role = await this.getRole(user.userID, id);
        return (role);
    }
    async grantUser(idFromRequest, getRoleRequest, userId, id, newRole) {
        if (getRoleRequest.role === "Owner"
            && Number(getRoleRequest.userId) === idFromRequest) {
            await this.roleService.grantAdminUserWithTransact(id, userId, newRole);
        }
    }
    banUser(id, userId, time, role) {
        if (time < 0)
            return;
        if (role === "Administrator" || role === "Owner")
            this.roleService.banUser(id, userId, time);
    }
    unBanUser(id, userId, role) {
        if (role === "Administrator" || role === "Owner") {
            this.roleService.unBanUser(id, userId);
        }
    }
    unMuteUser(id, userId, role) {
        if (role === "Administrator" || role === "Owner") {
            this.roleService.unMuteUser(id, userId);
        }
    }
    muteUser(id, userId, time, role) {
        if (time < 0)
            return;
        if (role === "Administrator" || role === "Owner")
            this.roleService.muteUser(id, userId, time);
    }
    kickUser(id, userId, role) {
        if (role === "Administrator" || role === "Owner")
            this.roleService.kickUser(id, userId);
    }
    setPsw(id, role, psw) {
        if (role === "Owner")
            this.roleService.setPsw(id, psw);
    }
    unSetPsw(id, role) {
        if (role === "Owner")
            this.roleService.unSetPsw(id);
    }
    async runActionAdmin(req, body) {
        const user = req.user;
        const getRole = await this.getRole(user.userID, body.id);
        const getRoleUserFocus = await this.getRole(body.userId, body.id);
        let action = body.action;
        action = action.charAt(0).toUpperCase() + action.slice(1);
        if (!getRoleUserFocus || getRoleUserFocus.role === "Owner")
            return (false);
        if (!getRole || user.userID === body.userId
            || (getRole.role !== "Owner" && getRole.role !== "Administrator"))
            return (false);
        switch (action) {
            case "Grant":
                this.grantUser(user.userID, getRole, body.userId, body.id, "Administrator");
                break;
            case "Remove":
                this.grantUser(user.userID, getRole, body.userId, body.id, "");
                break;
            case "Ban":
                this.banUser(body.id, body.userId, Number(body.option), getRole.role);
                break;
            case "Mute":
                this.muteUser(body.id, body.userId, Number(body.option), getRole.role);
                break;
            case "Kick":
                this.kickUser(body.id, body.userId, getRole.role);
                break;
            default:
                break;
        }
        return (true);
    }
    async runActionAdminSpecial(req, body) {
        console.log(body);
        const user = req.user;
        let action = body.action;
        const getRole = await this.getRole(user.userID, body.id);
        if (!getRole || user.userID === body.userId
            || (getRole.role !== "Owner" && getRole.role !== "Administrator"))
            return (false);
        switch (action) {
            case "unban":
                this.unBanUser(body.id, body.userId, getRole.role);
                break;
            case "unmute":
                this.unMuteUser(body.id, body.userId, getRole.role);
                break;
            default:
                break;
        }
        return (true);
    }
    async runActionAdminPsw(req, body) {
        const user = req.user;
        let action = body.action;
        const getRole = await this.getRole(user.userID, body.id);
        if (!getRole || getRole.role !== "Owner")
            return (false);
        if (action === "setpsw" && (!body.psw || body.psw === ""))
            return (false);
        switch (action) {
            case "setpsw":
                this.setPsw(body.id, getRole.role, body.psw);
                break;
            case "unsetpsw":
                this.unSetPsw(body.id, getRole.role);
                break;
            default:
                break;
        }
        return (true);
    }
};
__decorate([
    (0, common_1.Get)('getRole'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "getQueryRole", null);
__decorate([
    (0, common_1.Post)('role-action'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, role_action_dto_1.PostActionDto]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "runActionAdmin", null);
__decorate([
    (0, common_1.Post)('role-action-spe'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, role_action_dto_1.PostActionDto]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "runActionAdminSpecial", null);
__decorate([
    (0, common_1.Post)('role-action-psw'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, role_action_dto_1.PostActionDtoPsw]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "runActionAdminPsw", null);
RoleController = __decorate([
    (0, common_1.Controller)('chat-role'),
    __metadata("design:paramtypes", [role_service_1.RoleService])
], RoleController);
exports.RoleController = RoleController;
//# sourceMappingURL=role.controller.js.map