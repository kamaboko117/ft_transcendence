import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/typeorm";
import { DataSource, Repository } from "typeorm";
import { CreateUserDto } from "src/users/dto/users.dtos";
import { Stat } from "src/typeorm/stat.entity";
import { BlackFriendList } from "src/typeorm/blackFriendList.entity";
import { MatchHistory } from "src/typeorm/matchHistory.entity";
import { identity } from "rxjs";
import { Achievements } from "src/typeorm/achievement.entity";

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
        @InjectRepository(Achievements)
        private readonly achivementRepository: Repository<Achievements>,   
    ) { }

    async createUser(createUserDto: CreateUserDto) {
        const newUser = this.userRepository.create(createUserDto);
        const stat = new Stat();

        stat.level = 0;
        stat.rank = 0;
        stat.user = newUser;
        await this.statRepository.save(stat);
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
            .execute();
    }

    async updateUsername(user_id: number, username: string) {
        this.userRepository.createQueryBuilder()
            .update(User)
            .set({ username: username })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute();
    }

    async update2FA(user_id: number, fa: boolean, secret: string | null) {
        this.userRepository.createQueryBuilder()
            .update(User)
            .set({ fa: fa, secret_fa: secret!, fa_first_entry: false })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute();
    }

    async update2FaPsw(user_id: number, psw: string) {
        this.userRepository.createQueryBuilder()
            .update(User)
            .set({ fa_psw: psw })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute();
    }

    /* Will set to true fa_first_entry,
    this is needed to check if user has set his fa code for the first time */
    async updateFaFirstEntry(user_id: number) {
        this.userRepository.createQueryBuilder()
            .update(User)
            .set({ fa_first_entry: true })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute();
    }

    async updateTokenJwt(user_id: number, token: string) {
        await this.userRepository.createQueryBuilder()
            .update(User)
            .set({ token: token })
            .where("user_id = :id")
            .setParameters({ id: user_id })
            .execute();
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
            const ret_nb = await this.matchHistoryRepository.createQueryBuilder("match")
                .select(['user_victory'])
                .where('user_victory = :user')
                .setParameters({ user: id })//anti hack
                .getCount();
            return (ret_nb);
        }

        async getLevel(id: number) {
            const ret_nb = await this.statRepository.createQueryBuilder("stat")
                .select('stat.level')
                .where('stat.user_id = :user')
                .setParameters({ user: id })
                .getOne();
            return (ret_nb);
        }
    
        async getGamesNb(id: number) {
            const ret_nb = await this.matchHistoryRepository.createQueryBuilder("match")
                .select(['player_one', 'player_two'])
                .where('player_one = :user OR player_two = :user')
                .setParameters({user: id})
                .getCount()
            return(ret_nb);
        }
    /*
     * 	select type_game, t1.username, t2.username, t3.username
        from match_history
        inner join "user" t1 on player_one = t1.user_id
        inner join "user" t2 on player_two = t2.user_id
        inner join "user" t3 on user_victory = t3.user_id
        where (player_one = id OR player_two = id)
     */
    
    // SELECT (type_game, player_one, player_two, user_victory) FROM match_history WHERE (player_one = 74133 OR player_two = 74133);
        async getRawMH(id: number) {
            const ret_raw = await this.matchHistoryRepository.createQueryBuilder("match")
                .select(['type_game', 't1.username', 't2.username', 't3.username'])
                .innerJoin("User", "t1", "player_one = t1.user_id")
                .innerJoin("User", "t2", "player_two = t2.user_id")
                .innerJoin("User", "t3", "user_victory = t3.user_id")
                .where('player_one = :user OR player_two = :user')
                .setParameters({user: id})
                .getRawMany();
            return(ret_raw);
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


    async updateConsecutive(id:number, consecutive_nb: number) {
            await this.statRepository.createQueryBuilder()
            .update(Stat)
            .set({consecutive: consecutive_nb})
            .where('user_id = :id', {id})
            .execute()
    }

    async updateRank(id: number, rk: number) {
        this.statRepository.createQueryBuilder()
        .update(Stat)
        .set({rank: rk})
        .where('user_id = :id', {id})
        .execute()
    }

    async updateLevel(id: number, lvl: number) {
        this.statRepository.createQueryBuilder()
        .update(Stat)
        .set({level: Math.floor(lvl / 3)})
        .where('user_id = :id', {id})
        .execute()
    }

    async updateHistory(typeGame: string,id1: number, id2: number, idVictory: number) {
        if (id1 == id2)
            return;
        this.matchHistoryRepository.createQueryBuilder()
            .insert()
            .into(MatchHistory)
            .values([{
                type_game: typeGame, player_one: id1, player_two: id2, user_victory: idVictory
            }])
            .execute();
        //we want rank et consecutive victory
        const stat = await this.statRepository.createQueryBuilder("stat")
        .select(['stat.consecutive', 'stat.rank'])
        .where('stat.user_id = :id', {id: idVictory})
        .getOne()
        //update consecutive victory
        let nb_consecutive = 0;
        if (stat)
            nb_consecutive = stat.consecutive + 1;
        if (stat && id1 != idVictory) {
            this.updateConsecutive(id1, 0);
        } else if (stat && id2 != idVictory) {
            this.updateConsecutive(id2, 0);
        }
        if (stat && stat.rank < 2)
            this.updateConsecutive(idVictory, nb_consecutive);
        //update victory rank
        if (stat && nb_consecutive == 3) {
            this.updateConsecutive(idVictory, 0);
            if (stat.rank < 2) {
                this.updateRank(idVictory, stat.rank + 1);
            }
        }
        // taking nb_victory
        const vc = await this.getVictoryNb(idVictory);
        // updating level
        if (vc)
            this.updateLevel(idVictory, vc);
    }

    async insertAchivement(id: number, name: string) {
        await this.achivementRepository.createQueryBuilder()
        .insert()
        .into(Achievements)
        .values([{
            name: name, user_id: id
        }])
        .execute();
    }

    async checkIfUserHaveAch(id: number) {
        const check = await this.getAchivementById(id);
        const achOk = {
            fg: false,
            fv: false,
            fl: false,
            sr: false,
            gr: false
        }

        check.forEach(function(elem){
            console.log(elem)
            if (elem.name === "First game played !")
                achOk.fg = true;
            else if (elem.name === "First victory !")
                achOk.fv = true;
            else if (elem.name === "First Level !")
                achOk.fl = true;
            else if (elem.name === "SILVER rank !")
                achOk.sr = true;
            else if (elem.name === "GOLD rank !")
                achOk.gr = true;
        });
        return (achOk);
    }

    async updateAchive(id: number) {
        let typeAchivement = "";

        const nbGame = await this.getGamesNb(id);
        const nbVic = await this.getVictoryNb(id);
        const stat = await this.statRepository.createQueryBuilder("stat")
        .select(['stat.consecutive', 'stat.rank'])
        .where('stat.user_id = :id', {id: id})
        .getOne();
        const getLvl = await this.getLevel(id);

        const checkAchiv = await this.checkIfUserHaveAch(id);
        console.log(checkAchiv)
        console.log(nbGame)
        console.log(getLvl)
        if (nbGame == 1 && checkAchiv.fg == false)
            await this.insertAchivement(id, "First game played !");
        if (nbVic == 1 && checkAchiv.fv == false)
            await this.insertAchivement(id, "First victory !");
        if (getLvl && getLvl.level == 1 && checkAchiv.fl == false)
            await this.insertAchivement(id, "First Level !");
        if (stat?.rank == 1 && checkAchiv.sr == false)
            await this.insertAchivement(id, "SILVER rank !");
        if (stat?.rank == 2 && checkAchiv.gr == false)
            await this.insertAchivement(id, "GOLD rank !");
    }

    async getAchivementById(id: number) {
        const achiv = await this.achivementRepository.createQueryBuilder('ac')
        .select('ac.name')
        .where('ac.user_id = :id', {id: id})
        .getMany()
        return (achiv);
    }

    async findUserByIdForGuard(id: number) {
        const user: Promise<User | undefined | null> = this.userRepository.createQueryBuilder("user")
            .where('user_id = :user')
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
