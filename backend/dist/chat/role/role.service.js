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
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const chat_entity_1 = require("../chat.entity");
const lstuser_entity_1 = require("../lstuser.entity");
const role_gateway_1 = require("./role.gateway");
const lstban_entity_1 = require("../lstban.entity");
const lstmute_entity_1 = require("../lstmute.entity");
const bcrypt = require("bcrypt");
let RoleService = class RoleService {
    constructor(dataSource, roleGateway) {
        this.dataSource = dataSource;
        this.roleGateway = roleGateway;
    }
    getOwner(id) {
        const channel = this.chatsRepository.createQueryBuilder("channel")
            .where("channel.id = :id")
            .setParameters({ id: id })
            .getOne();
        return (channel);
    }
    async getHasPsw(id) {
        const channel = await this.chatsRepository.createQueryBuilder("channel")
            .select("channel.password")
            .where("channel.id = :id")
            .setParameters({ id: id })
            .getOne();
        if (channel && channel.password && channel.password != "")
            return (true);
        return (false);
    }
    getAccessType(id) {
        const channel = this.chatsRepository.createQueryBuilder("channel")
            .select("channel.accesstype")
            .where("channel.id = :id")
            .setParameters({ id: id })
            .getOne();
        return (channel);
    }
    getRole(id, userId) {
        const list_user = this.listUserRepository.createQueryBuilder("list_user")
            .where("list_user.chatid = :id")
            .andWhere("list_user.user_id = :userId")
            .setParameters({ id: id, userId: userId })
            .getOne();
        return (list_user);
    }
    getUser(id, userId) {
        return (this.listUserRepository.createQueryBuilder("list_user")
            .addSelect(["User.username", "User.avatarPath"])
            .innerJoin("list_user.user", "User")
            .where("list_user.chatid = :id")
            .andWhere("list_user.user_id = :userId")
            .setParameters({ id: id, userId: userId })
            .getOne());
    }
    async kickUser(id, user_id) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        try {
            const user = await this.getUser(id, user_id);
            if (!user) {
                throw new common_1.NotFoundException("User not found, couldn't kick user.");
            }
            await this.listUserRepository
                .createQueryBuilder()
                .delete()
                .from(lstuser_entity_1.ListUser)
                .where("chatid = :id")
                .setParameters({ id: id })
                .andWhere("user_id = :user_id")
                .setParameters({ user_id: user_id })
                .execute();
            await runner.commitTransaction();
            this.roleGateway.updateListChat(id);
            this.roleGateway.actionOnUser(id, user_id, user.user.username, user.user.avatarPath, "Kick");
        }
        catch (e) {
            await runner.rollbackTransaction();
        }
        finally {
            await runner.release();
        }
    }
    async muteUser(id, user_id, time) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        try {
            const user = await this.getUser(id, user_id);
            if (!user) {
                throw new common_1.NotFoundException("User not found, couldn't mute user.");
            }
            let date = new Date();
            date.setSeconds(date.getSeconds() + time);
            await this.listMuteRepository.createQueryBuilder()
                .insert()
                .into(lstmute_entity_1.ListMute)
                .values({
                time: date,
                user_id: user_id,
                chatid: id
            })
                .execute();
            await runner.commitTransaction();
            this.roleGateway.actionOnUser(id, user_id, user.user.username, user.user.avatarPath, "Mute");
        }
        catch (e) {
            await runner.rollbackTransaction();
        }
        finally {
            await runner.release();
        }
    }
    async banUser(id, user_id, time) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        try {
            const user = await this.getUser(id, user_id);
            if (!user) {
                throw new common_1.NotFoundException("User not found, couldn't ban user.");
            }
            let date = new Date();
            date.setSeconds(date.getSeconds() + time);
            await this.listBanRepository.createQueryBuilder()
                .insert()
                .into(lstban_entity_1.ListBan)
                .values({
                time: date,
                user_id: user_id,
                chatid: id
            })
                .execute();
            await this.listUserRepository
                .createQueryBuilder()
                .delete()
                .from(lstuser_entity_1.ListUser)
                .where("chatid = :id")
                .setParameters({ id: id })
                .andWhere("user_id = :user_id")
                .setParameters({ user_id: user_id })
                .execute();
            await runner.commitTransaction();
            this.roleGateway.updateListChat(id);
            this.roleGateway.actionOnUser(id, user_id, user.user.username, user.user.avatarPath, "Ban");
        }
        catch (e) {
            await runner.rollbackTransaction();
        }
        finally {
            await runner.release();
        }
    }
    async unBanUser(id, userId) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        try {
            const arr = await this.listBanRepository.createQueryBuilder("bl")
                .where("user_id = :userId")
                .setParameters({ userId: userId })
                .andWhere("chatid = :id")
                .setParameters({ id: id })
                .getMany();
            await this.listBanRepository.remove(arr);
            await runner.commitTransaction();
        }
        catch (e) {
            await runner.rollbackTransaction();
        }
        finally {
            await runner.release();
        }
    }
    async unMuteUser(id, userId) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        try {
            const arr = await this.listMuteRepository.createQueryBuilder("mt")
                .where("user_id = :userId")
                .setParameters({ userId: userId })
                .andWhere("chatid = :id")
                .setParameters({ id: id })
                .getMany();
            await this.listMuteRepository.remove(arr);
            await runner.commitTransaction();
        }
        catch (e) {
            await runner.rollbackTransaction();
        }
        finally {
            await runner.release();
        }
    }
    async grantAdminUserWithTransact(id, userId, newRole) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        try {
            const user = await this.getUser(id, userId);
            if (!user) {
                throw new common_1.NotFoundException("User not found, couldn't grant user.");
            }
            await this.listUserRepository.createQueryBuilder().update(lstuser_entity_1.ListUser)
                .set({ role: newRole })
                .where("id = :id")
                .setParameters({ id: user.id })
                .execute();
            await runner.commitTransaction();
            this.roleGateway.updateListChat(id);
        }
        catch (e) {
            await runner.rollbackTransaction();
        }
        finally {
            await runner.release();
        }
    }
    async setPsw(id, psw) {
        const runner = this.dataSource.createQueryRunner();
        let accesstype = '0';
        await runner.connect();
        await runner.startTransaction();
        try {
            const accessDb = await this.getAccessType(id);
            const salt = Number(process.env.CHAT_SALT);
            const password = bcrypt.hashSync(psw, salt);
            if (accessDb) {
                accesstype = accessDb.accesstype;
                if (accessDb.accesstype === '0')
                    accesstype = '1';
                else if (accessDb.accesstype === '2')
                    accesstype = '3';
            }
            await this.listUserRepository.createQueryBuilder().update(chat_entity_1.Channel)
                .set({ password: password, accesstype: accesstype })
                .where("id = :id")
                .setParameters({ id: id })
                .execute();
            await runner.commitTransaction();
        }
        catch (e) {
            await runner.rollbackTransaction();
        }
        finally {
            await runner.release();
        }
    }
    async unSetPsw(id) {
        const runner = this.dataSource.createQueryRunner();
        let accesstype = '0';
        await runner.connect();
        await runner.startTransaction();
        try {
            const accessDb = await this.getAccessType(id);
            if (accessDb) {
                accesstype = accessDb.accesstype;
                if (accessDb.accesstype === '1')
                    accesstype = '0';
                else if (accessDb.accesstype === '3')
                    accesstype = '2';
            }
            await this.listUserRepository.createQueryBuilder().update(chat_entity_1.Channel)
                .set({ password: "", accesstype: accesstype })
                .where("id = :id")
                .setParameters({ id: id })
                .execute();
            await runner.commitTransaction();
        }
        catch (e) {
            await runner.rollbackTransaction();
        }
        finally {
            await runner.release();
        }
    }
};
__decorate([
    (0, typeorm_2.InjectRepository)(chat_entity_1.Channel),
    __metadata("design:type", typeorm_1.Repository)
], RoleService.prototype, "chatsRepository", void 0);
__decorate([
    (0, typeorm_2.InjectRepository)(lstuser_entity_1.ListUser),
    __metadata("design:type", typeorm_1.Repository)
], RoleService.prototype, "listUserRepository", void 0);
__decorate([
    (0, typeorm_2.InjectRepository)(lstban_entity_1.ListBan),
    __metadata("design:type", typeorm_1.Repository)
], RoleService.prototype, "listBanRepository", void 0);
__decorate([
    (0, typeorm_2.InjectRepository)(lstmute_entity_1.ListMute),
    __metadata("design:type", typeorm_1.Repository)
], RoleService.prototype, "listMuteRepository", void 0);
RoleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        role_gateway_1.RoleGateway])
], RoleService);
exports.RoleService = RoleService;
//# sourceMappingURL=role.service.js.map