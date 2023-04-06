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
exports.ChatService = void 0;
const class_validator_1 = require("class-validator");
const bcrypt = require("bcrypt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_entity_1 = require("./chat.entity");
const lstban_entity_1 = require("./lstban.entity");
const lstmsg_entity_1 = require("./lstmsg.entity");
const lstmute_entity_1 = require("./lstmute.entity");
const lstuser_entity_1 = require("./lstuser.entity");
const blackFriendList_entity_1 = require("../typeorm/blackFriendList.entity");
const common_1 = require("@nestjs/common");
class Room {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Room.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Room.prototype, "psw", void 0);
let ChatService = class ChatService {
    async getAllPublic() {
        const arr = await this.chatsRepository
            .createQueryBuilder("channel")
            .innerJoin("channel.user", "User")
            .select(['channel.id',
            'channel.name', 'channel.user_id', 'channel.accesstype', "User.username"])
            .where("accesstype = :a1 OR accesstype = :a2")
            .setParameters({ a1: 0, a2: 1 })
            .getRawMany();
        return arr;
    }
    async getAllPrivate(userID) {
        const arr = await this.chatsRepository
            .createQueryBuilder("channel")
            .innerJoin("channel.lstUsr", "ListUser")
            .innerJoin("ListUser.user", "User")
            .select(['channel.id', 'channel.name',
            'channel.user_id', 'channel.accesstype',
            'User.username'])
            .where("(accesstype = :a1 OR accesstype = :a2) AND ListUser.user_id = :userID")
            .setParameters({ a1: 2, a2: 3, userID: userID })
            .getRawMany();
        return arr;
    }
    async getAllPmUser(userID) {
        const subquery = this.chatsRepository
            .createQueryBuilder("channel").subQuery()
            .from(chat_entity_1.Channel, "channel")
            .select("channel.id")
            .innerJoin("channel.lstUsr", "ListUser")
            .innerJoin("ListUser.user", "User")
            .where("channel.accesstype = :type", { type: '4' })
            .andWhere("ListUser.user_id = :user_id", { user_id: userID });
        const channel = await this.listUserRepository
            .createQueryBuilder("list_user")
            .select("list_user.chatid")
            .addSelect("User.username")
            .innerJoin("list_user.user", "User")
            .where("list_user.chatid IN " + subquery.getQuery())
            .andWhere("list_user.user_id != :user_id")
            .setParameters({ type: '4', user_id: userID })
            .getMany();
        return (channel);
    }
    async findDuplicateAndDelete(user_id) {
        const channel = await this.listUserRepository
            .createQueryBuilder("list_user")
            .select("list_user.user_id")
            .addSelect(["Channel.id", "Channel.name"])
            .innerJoin("list_user.chat", "Channel")
            .where("list_user.user_id = :id")
            .setParameters({ id: user_id })
            .andWhere("Channel.accesstype = :type")
            .setParameters({ type: '4' })
            .groupBy("list_user.user_id")
            .addGroupBy("Channel.id")
            .having("COUNT(list_user.user_id) >= :nb", { nb: 2 })
            .orHaving("COUNT(Channel.id) >= :otherNb", { otherNb: 2 })
            .getRawOne();
        if (channel) {
            await this.chatsRepository
                .createQueryBuilder()
                .delete()
                .from(chat_entity_1.Channel)
                .where("id = :id")
                .setParameters({ id: channel.Channel_id })
                .execute();
        }
    }
    async findPmUsers(userOne, userTwo) {
        const listUser = await this.listUserRepository
            .createQueryBuilder("list_user")
            .select("Channel.id")
            .innerJoin("list_user.chat", "Channel")
            .where("list_user.user_id IN (:userOne, :userTwo)")
            .setParameters({
            userOne: userOne,
            userTwo: Number(userTwo)
        })
            .andWhere("Channel.accesstype = :type")
            .setParameters({ type: '4' })
            .groupBy("Channel.id")
            .orHaving("COUNT(Channel.id) >= :nb")
            .setParameters({ nb: 2 })
            .getRawOne();
        return (listUser);
    }
    async createPrivateMessage(userOne, userTwo) {
        let newChat = {
            id: userOne + Number(userTwo),
            name: String(userOne + userTwo),
            accesstype: '4'
        };
        await this.chatsRepository.createQueryBuilder()
            .insert().into(chat_entity_1.Channel)
            .values({
            id: String(userOne + userTwo),
            name: String(userOne + userTwo),
            accesstype: '4'
        })
            .execute();
        await this.listUserRepository.createQueryBuilder()
            .insert().into(lstuser_entity_1.ListUser)
            .values([
            { user_id: userOne, chatid: String(userOne + userTwo) }
        ]).execute();
        await this.listUserRepository.createQueryBuilder()
            .insert().into(lstuser_entity_1.ListUser)
            .values([
            { user_id: Number(userTwo), chatid: String(userOne + userTwo) }
        ]).execute();
        return (String(userOne) + userTwo);
    }
    async getAllUserOnChannels(userID) {
        const channel = await this.chatsRepository
            .createQueryBuilder("channel")
            .select(["channel.id", "channel.name"])
            .innerJoin("channel.lstUsr", "ListUser")
            .where("(accesstype = :a1 OR accesstype = :a2 OR accesstype = :a3 OR accesstype = :a4) AND ListUser.user_id = :userID")
            .setParameters({ a1: 0, a2: 1, a3: 2, a4: 3, userID: userID })
            .getMany();
        return (channel);
    }
    async getListMsgByChannelId(id, userId) {
        const subQuery = this.blFrRepository.createQueryBuilder("bl")
            .subQuery()
            .from(blackFriendList_entity_1.BlackFriendList, "bl")
            .select("bl.focus_id")
            .where("bl.owner_id = :userId")
            .andWhere("bl.type_list = :type");
        const listMsg = await this.listMsgRepository.createQueryBuilder("list_msg")
            .select(["list_msg.user_id", "User.username", "User.avatarPath", "list_msg.content"])
            .innerJoin("list_msg.user", "User")
            .where("list_msg.chatid = :id")
            .setParameters({ id: id })
            .andWhere("list_msg.user_id NOT IN " + subQuery.getQuery())
            .setParameters({ userId: userId, type: 1 })
            .orderBy("list_msg.created_at", 'ASC')
            .getMany();
        return (listMsg);
    }
    async getChannelByTest(id) {
        const channel = await this.chatsRepository
            .createQueryBuilder("channel")
            .select(["channel.id", "channel.name", "channel.accesstype",
            "channel.user_id", "channel.password"])
            .where("channel.id = :id")
            .setParameters({ id: id })
            .getOne();
        return (channel);
    }
    async getChannelByName(name) {
        const channel = await this.chatsRepository.findOne({
            where: {
                name: name
            }
        });
        return (channel);
    }
    getUserMuted(id, user_id) {
        const user = this.listMuteRepository
            .createQueryBuilder("list_mute")
            .where("list_mute.chatid = :id")
            .setParameters({ id: id })
            .andWhere("list_mute.user_id = :user_id")
            .setParameters({ user_id: user_id })
            .andWhere("list_mute.time > :time")
            .setParameters({ time: "NOW()" })
            .getOne();
        return (user);
    }
    async getUserOnChannel(id, user_id) {
        const listBan = await this.listBanRepository
            .createQueryBuilder("list_ban")
            .select("list_ban.user_id")
            .where("list_ban.user_id = :user_id")
            .setParameters({ user_id: user_id })
            .andWhere("list_ban.time > :time")
            .setParameters({ time: "NOW()" })
            .andWhere("list_ban.chatid = :id")
            .setParameters({ id: id })
            .getMany();
        if (listBan.length > 0)
            return ("Ban");
        const user = await this.chatsRepository
            .createQueryBuilder("channel")
            .innerJoin("channel.lstUsr", "ListUser")
            .innerJoinAndSelect("ListUser.user", "User")
            .select(["channel.id", "channel.name", "channel.accesstype", "Channel.user_id", "User.username", "User.avatarPath"])
            .where("channel.id = :id")
            .setParameters({ id: id })
            .andWhere("User.userID = :user_id")
            .setParameters({ user_id: user_id })
            .getRawOne();
        return (user);
    }
    async getAllUsersOnChannel(id, userId) {
        const bl = this.blFrRepository.createQueryBuilder("t1").subQuery()
            .from(blackFriendList_entity_1.BlackFriendList, "t1")
            .select(["focus_id", "type_list"])
            .where("owner_id = :ownerId")
            .andWhere("type_list = :type1");
        const fl = this.blFrRepository.createQueryBuilder("t2").subQuery()
            .from(blackFriendList_entity_1.BlackFriendList, "t2")
            .select(["focus_id", "type_list"])
            .where("owner_id = :ownerId")
            .andWhere("type_list = :type2");
        const arr = await this.listUserRepository
            .createQueryBuilder("list_user")
            .select(["list_user.user_id", "list_user.role"])
            .addSelect(["User.username", "User.avatarPath"])
            .addSelect("t1.type_list AS bl")
            .addSelect("t2.type_list AS fl")
            .innerJoin("list_user.user", "User")
            .leftJoin(bl.getQuery(), "t1", "t1.focus_id = User.user_id")
            .setParameters({ type1: 1, ownerId: userId })
            .leftJoin(fl.getQuery(), "t2", "t2.focus_id = User.user_id")
            .setParameters({ type2: 2, ownerId: userId })
            .where("list_user.chatid = :id")
            .setParameters({ id: id })
            .orderBy("User.username", 'ASC')
            .getRawMany();
        return (arr);
    }
    createChat(chat, id, owner) {
        chat.id = id;
        let newChat = {
            id: chat.id, name: chat.name, owner: owner.idUser,
            accesstype: chat.accesstype, password: chat.password,
            lstMsg: chat.lstMsg,
            lstUsr: chat.lstUsr, lstMute: chat.lstMute,
            lstBan: chat.lstBan
        };
        const channel = new chat_entity_1.Channel();
        channel.id = newChat.id;
        channel.name = newChat.name;
        channel.user_id = owner.idUser;
        channel.accesstype = newChat.accesstype;
        channel.password = newChat.password;
        const listUsr = new lstuser_entity_1.ListUser();
        listUsr.user_id = owner.idUser;
        listUsr.role = "Owner";
        listUsr.chat = channel;
        this.listUserRepository.save(listUsr);
        const return_chat = {
            channel_id: newChat.id,
            channel_name: newChat.name,
            User_username: String(owner.username),
            channel_accesstype: newChat.accesstype,
        };
        return (return_chat);
    }
    async setNewUserChannel(channel, user_id, data) {
        if (channel.password != '' && channel.password != null) {
            if (data.psw === "" || data.psw === null)
                return (undefined);
            const comp = bcrypt.compareSync(data.psw, channel.password);
            if (comp === false)
                return (undefined);
        }
        await this.listUserRepository
            .createQueryBuilder()
            .insert()
            .into(lstuser_entity_1.ListUser)
            .values([{
                user_id: user_id,
                chatid: data.id
            }])
            .execute();
        return (true);
    }
};
__decorate([
    (0, typeorm_1.InjectRepository)(chat_entity_1.Channel),
    __metadata("design:type", typeorm_2.Repository)
], ChatService.prototype, "chatsRepository", void 0);
__decorate([
    (0, typeorm_1.InjectRepository)(lstuser_entity_1.ListUser),
    __metadata("design:type", typeorm_2.Repository)
], ChatService.prototype, "listUserRepository", void 0);
__decorate([
    (0, typeorm_1.InjectRepository)(lstmsg_entity_1.ListMsg),
    __metadata("design:type", typeorm_2.Repository)
], ChatService.prototype, "listMsgRepository", void 0);
__decorate([
    (0, typeorm_1.InjectRepository)(lstban_entity_1.ListBan),
    __metadata("design:type", typeorm_2.Repository)
], ChatService.prototype, "listBanRepository", void 0);
__decorate([
    (0, typeorm_1.InjectRepository)(lstmute_entity_1.ListMute),
    __metadata("design:type", typeorm_2.Repository)
], ChatService.prototype, "listMuteRepository", void 0);
__decorate([
    (0, typeorm_1.InjectRepository)(blackFriendList_entity_1.BlackFriendList),
    __metadata("design:type", typeorm_2.Repository)
], ChatService.prototype, "blFrRepository", void 0);
ChatService = __decorate([
    (0, common_1.Injectable)()
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map