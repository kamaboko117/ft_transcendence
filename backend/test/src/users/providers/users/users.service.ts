import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/typeorm";
import { DataSource, Repository } from "typeorm";
import { CreateUserDto } from "src/users/dto/users.dtos";
import { Stat } from "src/typeorm/stat.entity";
import { BlackFriendList } from "src/typeorm/blackFriendList.entity";
import { MatchHistory } from "src/typeorm/matchHistory.entity";

const validateURL = "https://api.intra.42.fr/oauth/token"
const infoURL = "https://api.intra.42.fr/oauth/token/info"
const appId = process.env.APP_ID!;
const appSecret = process.env.APP_SECRET!;

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Stat)
        private readonly statRepository: Repository<Stat>,
        @InjectRepository(BlackFriendList)
        private readonly blFrRepository: Repository<BlackFriendList>,
        @InjectRepository(MatchHistory)
        private readonly matchHistoryRepository: Repository<MatchHistory>,
        private dataSource: DataSource,
    ) { }

    /*
        consulte ca pour t'aider :
        https://orkhan.gitbook.io/typeorm/docs/select-query-builder
        UTILISE CA POUR AJOUTER LA FRIEND LIST ET BLACK LIST
        await this.listUserRepository
        .createQueryBuilder()
        .insert()
        .into(ListUser) << modifier pour les entites
        .values([{
            user_id: user_id, << modifier dans values
            chatid: data.id
        }])
        .execute();
    */
    async createUser(createUserDto: CreateUserDto) {
        const newUser = this.userRepository.create(createUserDto);
        const stat = new Stat();

        stat.level = 0;
        stat.rank = 0;
        stat.user = newUser;
        this.statRepository.save(stat);
        return (newUser);
    }

    async getToken(code: string): Promise<{ access_token: string, refresh_token: string } | undefined> {
        const formData = new FormData();
        let token: {
            access_token: string,
            refresh_token: string
        };

        formData.append("grant_type", "authorization_code");
        formData.append("client_id", appId);
        formData.append("client_secret", appSecret);
        formData.append("code", code);
        formData.append("redirect_uri", process.env.VITE_APP_URI + "/validate");
        formData.append("state", "pouet2");
        console.log(formData);
        console.log("CODE: " + code);

        const res = await fetch(validateURL, {
            method: "POST",
            body: formData
        }).then(res => {
            if (res.ok) {
                return (res.json());
            }
            return (undefined)
        }).catch(e => console.log(e));
        if (typeof res === "undefined" || typeof res.access_token === "undefined")
            return (undefined);
        token = {
            access_token: res.access_token,
            refresh_token: res.refresh_token
        };
        console.log(`token: ${token}`);
        if (typeof token == "undefined")
            return (undefined);
        return (token);
    }

    async getInformationBearer(token: { access_token: string, refresh_token: string }): Promise<number> {
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

    async updatePathAvatarUser(user_id: number, path: string) {
        this.userRepository.createQueryBuilder()
            .update(User)
            .set({ avatarPath: path })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute()
    }

    async updateUsername(user_id: number, username: string) {
        this.userRepository.createQueryBuilder()
            .update(User)
            .set({ username: username })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute()
    }

    async update2FA(user_id: number, fa: boolean, secret: string | null) {
        this.userRepository.createQueryBuilder()
            .update(User)
            .set({ fa: fa, secret_fa: secret!, fa_first_entry: false })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute()
    }

    async update2FaPsw(user_id: number, psw: string) {
        this.userRepository.createQueryBuilder()
            .update(User)
            .set({fa_psw: psw})
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute()
    }

    /* Will set to true fa_first_entry,
    this is needed to check if user has set his fa code for the first time */
    async updateFaFirstEntry(user_id: number) {
        this.userRepository.createQueryBuilder()
            .update(User)
            .set({ fa_first_entry: true })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute()
    }

    /*
        exemple requete sql avec un innerjoin facon typeorm
        createQueryBuilder("list_msg")
        .select(['list_msg.idUser',
          'list_msg.username', 'list_msg.content'])
        .innerJoin("list_msg.chat", "lstMsg")
        .where("list_msg.chatid = :id")
        .setParameters({ id: element.id })
        .getMany() OU getOne();
    */

    async getUserProfile(id: number) {
        const user: User | undefined | null = await this.userRepository.createQueryBuilder("user")
            .select(['user.username', 'user.userID', 'user.avatarPath', 'user.fa'])
            .addSelect(["Stat.level", "Stat.rank"])//ici ajout les column des inner joins
            .innerJoin('user.sstat', 'Stat')// utiliser l''alias a droite, obligatoire je crois
            .where('user.user_id = :user') //:user = setParameters()
            .setParameters({ user: id })//anti hack
            .getOne();
        //console.log(user);
        return (user);
    }


    /* Nombre de Partie joué(s)
     * SELECT COUNT("player_one", "player_two") 
     * FROM "match_history" 
     * WHERE "player_two" = id OR "player_one" = id
     */

    /* Nombre de Partie gangée(s)
     * SELECT COUNT("user_victory")
     * FROM "match_history"
     * WHERE "user_victory" = id
     */
    async getVictoryNb(id: number) {
        console.log('id = ' + id);
        const ret_nb = await this.matchHistoryRepository.createQueryBuilder("match")
            .select(['user_victory'])
            .where('user_victory = :user')
            .setParameters({ user: id })//anti hack
            .getCount();
        return (ret_nb);
    }

    async getGamesNb(id: number) {
        console.log('id = ' + id);
        const ret_nb = await this.matchHistoryRepository.createQueryBuilder("match")
            .select(['player_one', 'player_two'])
            .where('player_one = :user OR player_two = :user')
            .setParameters({user: id})
            .getCount()
        return(ret_nb);
    }

    async findUsersById(id: number) {
        const user: User | undefined | null = await this.userRepository.createQueryBuilder("user")
            .select(['user.username', 'user.userID', 'user.avatarPath', 'user.fa'])
            .addSelect(["Stat.level", "Stat.rank"])
            .innerJoin('user.sstat', 'Stat')
            .where('user.user_id = :user')
            .setParameters({ user: id })
            .getOne();
        return (user);
    }

    async findUserByIdForGuard(id: number) {
        const user: User | undefined | null = await this.userRepository.createQueryBuilder("user")
            .where('user.user_id = :user')
            .setParameters({ user: id })
            .getOne();
        return (user);
    }

    async getUserFaSecret(id: number) {
        const user: User | undefined | null = await this.userRepository.createQueryBuilder("user")
            .select(['user.fa', 'user.secret_fa',
                'user.username', 'user.fa_first_entry', 'user.fa_psw'])
            .where('user.user_id = :user')
            .setParameters({ user: id })
            .getOne();
        return (user);
    }

    async findUserByName(username: string) {
        const user: User | null = await this.userRepository.createQueryBuilder("user")
            .select(["user.userID", "user.username", "user.fa", "user.avatarPath"])
            .where('user.username = :name')
            .setParameters({ name: username })
            .getOne();
        return (user);
    }
    /* friend black list part */
    searchUserInList(ownerId: number, focusId: number, type: number) {
        const user = this.blFrRepository.createQueryBuilder("fl")
            .where("fl.owner_id = :ownerId")
            .andWhere("fl.focus_id = :focusId")
            .andWhere("fl.type_list = :type")
            .setParameters({ ownerId: ownerId, focusId: focusId, type: type })
            .getOne();
        return (user);
    }

    async getFriendList(user_id: number) {
        const list = this.blFrRepository.createQueryBuilder("fl")
            .select(["fl.focus_id AS id", "fl.type_list AS fl"])
            .where("fl.owner_id = :ownerId")
            .setParameters({ ownerId: user_id })
            .getRawMany();

        return (list);
    }

    focusUserBlFr(ownerId: number, focusId: number) {
        const fl = this.blFrRepository.createQueryBuilder("fl").subQuery()
            .from(BlackFriendList, "fl")
            .select(["focus_id", "type_list"])
            .where("owner_id = :ownerId")
            .andWhere("focus_id = :focusId")
            .andWhere("type_list = :type1")
        const bl = this.blFrRepository.createQueryBuilder("bl").subQuery()
            .from(BlackFriendList, "bl")
            .select(["focus_id", "type_list"])
            .where("owner_id = :ownerId")
            .andWhere("focus_id = :focusId")
            .andWhere("type_list = :type2")
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

    getBlackFriendListBy(user_id: number) {
        const fl = this.blFrRepository.createQueryBuilder("fl").subQuery()
            .from(BlackFriendList, "fl")
            .select(["focus_id", "type_list"])
            .where("owner_id = :ownerId")
            .andWhere("type_list = :type1")
        const bl = this.blFrRepository.createQueryBuilder("bl").subQuery()
            .from(BlackFriendList, "bl")
            .select(["focus_id", "type_list"])
            .where("owner_id = :ownerId")
            .andWhere("type_list = :type2")

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
        console.log(list);
        return (list);
    }

    /* add remove friend - block unblock user part */

    findBlFr(ownerId: number, focusUserId: number, type: number): Promise<BlackFriendList | null> {
        const list: Promise<BlackFriendList | null> = this.blFrRepository.createQueryBuilder("bl_fr")
            .where("bl_fr.owner_id = :ownerId")
            .setParameters({ ownerId: ownerId })
            .andWhere("bl_fr.focus_id = :focusUserId")
            .setParameters({ focusUserId: focusUserId })
            .andWhere("bl_fr.type_list = :type")
            .setParameters({ type: type })
            .getOne()
        return (list)
    }
    /* insert blacklist or friendlist */
    async insertBlFr(ownerId: number, focusUserId: number, type: number) {
        const runner = this.dataSource.createQueryRunner();

        await runner.connect();
        await runner.startTransaction();
        try {
            await this.blFrRepository
                .createQueryBuilder()
                .insert()
                .into(BlackFriendList)
                .values([{
                    type_list: type, owner_id: ownerId, focus_id: focusUserId
                }])
                .execute();
            await runner.commitTransaction();
        } catch (e) {
            await runner.rollbackTransaction();
        } finally {
            //doc want it released
            await runner.release();
        }
    }

    async deleteBlFr(ownerId: number, focusUserId: number, type: number, findId: number) {
        const runner = this.dataSource.createQueryRunner();

        await runner.connect();
        await runner.startTransaction();
        try {
            await this.blFrRepository
                .createQueryBuilder()
                .delete()
                .from(BlackFriendList)
                .where("id = :id")
                .setParameters({ id: findId })
                .execute();
            await runner.commitTransaction();
        } catch (e) {
            await runner.rollbackTransaction();
        } finally {
            //doc want it released
            await runner.release();
        }
    }
    /* end add remove friend - block unblock user part  */
}
