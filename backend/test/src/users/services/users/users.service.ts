import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/typeorm";
import { DataSource, Repository } from "typeorm";
import { CreateUserDto } from "src/users/dto/users.dtos";
import { Stat } from "src/typeorm/stat.entity";
import { BlackFriendList } from "src/typeorm/blackFriendList.entity";

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

        stat.defeat = 0;
        stat.level = 0;
        stat.nb_games = 0;
        stat.rank = 0;
        stat.user = newUser;
        stat.victory = 0;
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
        }).catch(e=>console.log(e));
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
        }).then(res => res.json()).catch(e=>console.log(e));
        return (res.resource_owner_id);
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
            .select(['user.username', 'user.userID', 'user.avatarPath'])
            .addSelect(["Stat.victory", "Stat.defeat",
                "Stat.nb_games", "Stat.level", "Stat.rank"])//ici ajout les column des inner joins
            .innerJoin('user.sstat', 'Stat')// utiliser l''alias a droite, obligatoire je crois
            .where('user.user_id = :user') //:user = setParameters()
            .setParameters({ user: id })//anti hack
            .getOne();
        console.log(user);
        return (user);
    }

    async findUsersById(id: number) {
        const user: User | undefined | null = await this.userRepository.createQueryBuilder("user")
            .select(['user.username', 'user.userID', 'user.avatarPath'])
            .where('user.user_id = :user')
            .setParameters({ user: id })
            .getOne();
        return (user);
    }

    async findUserByName(username: string) {
        const user: User | null = await this.userRepository.createQueryBuilder("user")
            .select(["user.userID", "user.username"])
            .where('user.username = :name')
            .setParameters({ name: username })
            .getOne();
        return (user);
    }

    /* add remove friend - block unblock user part */

    findBlFr(ownerId: number, focusUserId: number, type: number): Promise<BlackFriendList | null> {
        const list: Promise<BlackFriendList | null> = this.blFrRepository.createQueryBuilder("bl_fr")
            .where("bl_fr.owner_id = :ownerId")
            .setParameters({ownerId: ownerId})
            .andWhere("bl_fr.focus_id = :focusUserId")
            .setParameters({focusUserId: focusUserId})
            .andWhere("bl_fr.type_list = :type")
            .setParameters({type: type})
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
