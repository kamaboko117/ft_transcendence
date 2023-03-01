import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "src/users/dto/users.dtos";
import { randomBytes } from "crypto";

const validateURL = "https://api.intra.42.fr/oauth/token"
const infoURL = "https://api.intra.42.fr/oauth/token/info"
const appId = process.env.APP_ID!;
const appSecret = process.env.APP_SECRET!;

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    async createUser(createUserDto: CreateUserDto) {
        const newUser = this.userRepository.create(createUserDto);

        this.userRepository.save(newUser)
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
        });
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
        }).then(res => res.json());
        return (res.resource_owner_id);
	}
    getUsers() {
        return this.userRepository.find();
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
        const user: any = await this.userRepository.createQueryBuilder("user")
            .select(['user.username', 'user.token', 'user.userID', 'user.avatarPath'])
            .where('user.user_id = :user') //:user = setParameters()
            .setParameters({ user: id })//anti hack
            .getOne();
        return (user);
        //return this.userRepository.findOneBy({id: id});
    }

    async findUsersById(id: number) {
        const user: any = await this.userRepository.createQueryBuilder("user")
            .select(['user.username', 'user.token', 'user.userID', 'user.avatarPath'])
            .where('user.user_id = :user')
            .setParameters({ user: id })
            .getOne();
        return (user);
        //return this.userRepository.findOneBy({id: id});
    }
}
