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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("../../../typeorm");
const typeorm_3 = require("typeorm");
const stat_entity_1 = require("../../../typeorm/stat.entity");
const blackFriendList_entity_1 = require("../../../typeorm/blackFriendList.entity");
const matchHistory_entity_1 = require("../../../typeorm/matchHistory.entity");
const validateURL = "https://api.intra.42.fr/oauth/token";
const infoURL = "https://api.intra.42.fr/oauth/token/info";
const appId = process.env.APP_ID;
const appSecret = process.env.APP_SECRET;
let UsersService = class UsersService {
    constructor(userRepository, statRepository, blFrRepository, matchHistoryRepository, dataSource) {
        this.userRepository = userRepository;
        this.statRepository = statRepository;
        this.blFrRepository = blFrRepository;
        this.matchHistoryRepository = matchHistoryRepository;
        this.dataSource = dataSource;
    }
    async createUser(createUserDto) {
        const newUser = this.userRepository.create(createUserDto);
        const stat = new stat_entity_1.Stat();
        stat.level = 0;
        stat.rank = 0;
        stat.user = newUser;
        await this.statRepository.save(stat);
        return (newUser);
    }
    async getToken(code) {
        const formData = new FormData();
        let token;
        formData.append("grant_type", "authorization_code");
        formData.append("client_id", appId);
        formData.append("client_secret", appSecret);
        formData.append("code", code);
        formData.append("redirect_uri", process.env.VITE_APP_URI + "/validate");
        formData.append("state", "pouet2");
        const res = await fetch(validateURL, {
            method: "POST",
            body: formData
        }).then(res => {
            if (res.ok) {
                return (res.json());
            }
            return (undefined);
        }).catch(e => console.log(e));
        if (typeof res === "undefined" || typeof res.access_token === "undefined")
            return (undefined);
        token = {
            access_token: res.access_token,
            refresh_token: res.refresh_token
        };
        if (typeof token == "undefined")
            return (undefined);
        return (token);
    }
    async getInformationBearer(token) {
        const res = await fetch(infoURL, {
            headers: {
                authorization: `Bearer ${token.access_token}`
            }
        }).then(res => res.json()).catch(e => console.log(e));
        if (res)
            return (res.resource_owner_id);
        return (0);
    }
    getUsers() {
        return this.userRepository.find();
    }
    async updatePathAvatarUser(user_id, path) {
        this.userRepository.createQueryBuilder()
            .update(typeorm_2.User)
            .set({ avatarPath: path })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute();
    }
    async updateUsername(user_id, username) {
        this.userRepository.createQueryBuilder()
            .update(typeorm_2.User)
            .set({ username: username })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute();
    }
    async update2FA(user_id, fa, secret) {
        this.userRepository.createQueryBuilder()
            .update(typeorm_2.User)
            .set({ fa: fa, secret_fa: secret, fa_first_entry: false })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute();
    }
    async update2FaPsw(user_id, psw) {
        this.userRepository.createQueryBuilder()
            .update(typeorm_2.User)
            .set({ fa_psw: psw })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute();
    }
    async updateFaFirstEntry(user_id) {
        this.userRepository.createQueryBuilder()
            .update(typeorm_2.User)
            .set({ fa_first_entry: true })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute();
    }
    async updateTokenJwt(user_id, token) {
        await this.userRepository.createQueryBuilder()
            .update(typeorm_2.User)
            .set({ token: token })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute();
    }
    async getUserProfile(id) {
        const user = await this.userRepository.createQueryBuilder("user")
            .select(['user.username', 'user.userID', 'user.avatarPath', 'user.fa'])
            .addSelect(["Stat.level", "Stat.rank"])
            .innerJoin('user.sstat', 'Stat')
            .where('user.user_id = :user')
            .setParameters({ user: id })
            .getOne();
        return (user);
    }
    async getVictoryNb(id) {
        const ret_nb = await this.matchHistoryRepository.createQueryBuilder("match")
            .select(['user_victory'])
            .where('user_victory = :user')
            .setParameters({ user: id })
            .getCount();
        return (ret_nb);
    }
    async getGamesNb(id) {
        const ret_nb = await this.matchHistoryRepository.createQueryBuilder("match")
            .select(['player_one', 'player_two'])
            .where('player_one = :user OR player_two = :user')
            .setParameters({ user: id })
            .getCount();
        return (ret_nb);
    }
    async getRawMH(id) {
        const ret_raw = await this.matchHistoryRepository.createQueryBuilder("match")
            .select(['type_game', 't1.username', 't2.username', 't3.username'])
            .innerJoin("User", "t1", "player_one = t1.user_id")
            .innerJoin("User", "t2", "player_two = t2.user_id")
            .innerJoin("User", "t3", "user_victory = t3.user_id")
            .where('player_one = :user OR player_two = :user')
            .setParameters({ user: id })
            .getRawMany();
        return (ret_raw);
    }
    async findUsersById(id) {
        const user = await this.userRepository.createQueryBuilder("user")
            .select(['user.username', 'user.userID', 'user.avatarPath', 'user.fa'])
            .addSelect(["Stat.level", "Stat.rank"])
            .innerJoin('user.sstat', 'Stat')
            .where('user.user_id = :user')
            .setParameters({ user: id })
            .getOne();
        return (user);
    }
    async findUserByIdForGuard(id) {
        const user = this.userRepository.createQueryBuilder("user")
            .where('user_id = :user')
            .setParameters({ user: id })
            .getOne();
        return (user);
    }
    async getUserFaSecret(id) {
        const user = await this.userRepository.createQueryBuilder("user")
            .select(['user.fa', 'user.secret_fa',
            'user.username', 'user.fa_first_entry', 'user.fa_psw'])
            .where('user.user_id = :user')
            .setParameters({ user: id })
            .getOne();
        return (user);
    }
    async findUserByName(username) {
        const user = await this.userRepository.createQueryBuilder("user")
            .select(["user.userID", "user.username", "user.fa", "user.avatarPath"])
            .where('user.username = :name')
            .setParameters({ name: username })
            .getOne();
        return (user);
    }
    searchUserInList(ownerId, focusId, type) {
        const user = this.blFrRepository.createQueryBuilder("fl")
            .where("fl.owner_id = :ownerId")
            .andWhere("fl.focus_id = :focusId")
            .andWhere("fl.type_list = :type")
            .setParameters({ ownerId: ownerId, focusId: focusId, type: type })
            .getOne();
        return (user);
    }
    async getFriendList(user_id) {
        const list = this.blFrRepository.createQueryBuilder("fl")
            .select(["fl.focus_id AS id", "fl.type_list AS fl"])
            .where("fl.owner_id = :ownerId")
            .setParameters({ ownerId: user_id })
            .getRawMany();
        return (list);
    }
    focusUserBlFr(ownerId, focusId) {
        const fl = this.blFrRepository.createQueryBuilder("fl").subQuery()
            .from(blackFriendList_entity_1.BlackFriendList, "fl")
            .select(["focus_id", "type_list"])
            .where("owner_id = :ownerId")
            .andWhere("focus_id = :focusId")
            .andWhere("type_list = :type1");
        const bl = this.blFrRepository.createQueryBuilder("bl").subQuery()
            .from(blackFriendList_entity_1.BlackFriendList, "bl")
            .select(["focus_id", "type_list"])
            .where("owner_id = :ownerId")
            .andWhere("focus_id = :focusId")
            .andWhere("type_list = :type2");
        const list = this.blFrRepository.createQueryBuilder("a")
            .distinct(true)
            .select("a.focus_id AS id")
            .addSelect("bl.type_list AS bl")
            .addSelect("fl.type_list AS fl")
            .addSelect("User.username")
            .leftJoin(fl.getQuery(), "fl", "fl.focus_id = a.focus_id")
            .setParameters({ type1: 2 })
            .leftJoin(bl.getQuery(), "bl", "bl.focus_id = a.focus_id")
            .setParameters({ type2: 1 })
            .innerJoin("a.userFocus", "User")
            .where("a.owner_id = :ownerId")
            .setParameters({ ownerId: ownerId })
            .andWhere("a.focus_id = :focusId")
            .setParameters({ focusId: focusId })
            .getRawOne();
        return (list);
    }
    getBlackFriendListBy(user_id) {
        const fl = this.blFrRepository.createQueryBuilder("fl").subQuery()
            .from(blackFriendList_entity_1.BlackFriendList, "fl")
            .select(["focus_id", "type_list"])
            .where("owner_id = :ownerId")
            .andWhere("type_list = :type1");
        const bl = this.blFrRepository.createQueryBuilder("bl").subQuery()
            .from(blackFriendList_entity_1.BlackFriendList, "bl")
            .select(["focus_id", "type_list"])
            .where("owner_id = :ownerId")
            .andWhere("type_list = :type2");
        const list = this.blFrRepository.createQueryBuilder("a")
            .distinct(true)
            .select("a.focus_id AS id")
            .addSelect("bl.type_list AS bl")
            .addSelect("fl.type_list AS fl")
            .addSelect(["User.username", "User.avatarPath"])
            .leftJoin(fl.getQuery(), "fl", "fl.focus_id = a.focus_id")
            .setParameters({ type1: 2 })
            .leftJoin(bl.getQuery(), "bl", "bl.focus_id = a.focus_id")
            .setParameters({ type2: 1 })
            .innerJoin("a.userFocus", "User")
            .where("a.owner_id = :ownerId")
            .setParameters({ ownerId: user_id })
            .getRawMany();
        return (list);
    }
    findBlFr(ownerId, focusUserId, type) {
        const list = this.blFrRepository.createQueryBuilder("bl_fr")
            .where("bl_fr.owner_id = :ownerId")
            .setParameters({ ownerId: ownerId })
            .andWhere("bl_fr.focus_id = :focusUserId")
            .setParameters({ focusUserId: focusUserId })
            .andWhere("bl_fr.type_list = :type")
            .setParameters({ type: type })
            .getOne();
        return (list);
    }
    async insertBlFr(ownerId, focusUserId, type) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        try {
            await this.blFrRepository
                .createQueryBuilder()
                .insert()
                .into(blackFriendList_entity_1.BlackFriendList)
                .values([{
                    type_list: type, owner_id: ownerId, focus_id: focusUserId
                }])
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
    async deleteBlFr(ownerId, focusUserId, type, findId) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        try {
            await this.blFrRepository
                .createQueryBuilder()
                .delete()
                .from(blackFriendList_entity_1.BlackFriendList)
                .where("id = :id")
                .setParameters({ id: findId })
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
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(typeorm_2.User)),
    __param(1, (0, typeorm_1.InjectRepository)(stat_entity_1.Stat)),
    __param(2, (0, typeorm_1.InjectRepository)(blackFriendList_entity_1.BlackFriendList)),
    __param(3, (0, typeorm_1.InjectRepository)(matchHistory_entity_1.MatchHistory)),
    __metadata("design:paramtypes", [typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.Repository,
        typeorm_3.DataSource])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map