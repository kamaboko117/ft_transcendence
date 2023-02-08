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
    ) {}

    async createUser(createUserDto: CreateUserDto) {
        const newUser = this.userRepository.create(createUserDto);
        //newUser.token = randomBytes(64).toString('hex');
        this.userRepository.save(newUser)
        return (newUser);
    }
    
    async getToken(code: string): Promise<string | undefined> {
        const formData = new FormData();
        let token: string;

        formData.append("grant_type", "authorization_code");
        formData.append("client_id", appId);
        formData.append("client_secret", appSecret);
        formData.append("code", code);
        formData.append("redirect_uri", "http://localhost:4000/validate");
        formData.append("state", "pouet2");
        console.log(formData);
        console.log("CODE: " + code);

        const res = await fetch(validateURL, {
            method: "POST",
            body: formData
        }).then(res => {
            if (res.ok)
            {
                return (res.json());
            }
            return (undefined)
        });
        if (typeof res === "undefined" || typeof res.access_token === "undefined")
            return (undefined);
        token = res.access_token;
        console.log(`token: ${token}`);
        if (typeof token == "undefined")
            return (undefined);
        return(token);
        return (undefined);
    }
    async getInformationBearer(token: string): Promise<number> {
        const res = await fetch(infoURL, {
            headers: {
                authorization: `Bearer ${token}`
            }
        }).then(res => res.json());
        return(res.resource_owner_id);
    }
    
    //ne pas toucher à cette fonction
    async validateUser(code: string) {
        console.log("ALLO");
        const formData = new FormData();
        formData.append("grant_type", "authorization_code");
        formData.append("client_id", appId);
        formData.append("client_secret", appSecret);
        formData.append("code", code);
        formData.append("redirect_uri", "http://localhost:4000/validate");
        formData.append("state", "pouet2");
        console.log(formData);
        
        let res = await fetch(validateURL, {
            method: "POST",
            body: formData
        })
        // console.log(res);
        let resJSON = await res.json();
        console.log("resJson: " + resJSON);
        const token = resJSON.access_token;
        console.log(`token: ${token}`);
        if (typeof token == "undefined")
            return ([false, -1]);
        res = await fetch(infoURL, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        //undefined part
        resJSON = await res.json();
        return(resJSON);
        /*
        if (typeof token == "undefined")
            return ([false, undefined]);
        const id: number = resJSON.resource_owner_id;
        console.log(`id: ${id}`);
        const user = await this.userRepository.findOneBy({userID: id});
        if (user && user.username) {
            return [true, user];
        }
    
        return [false, id];*/
    }

    getUsers() {
        return this.userRepository.find();
    }

    async findUsersById(id: number) {
        const user: any = await this.userRepository.createQueryBuilder("user")
            .select(['user.username', 'user.token', 'user.userID', 'user.id'])
            .where('user.user_id = :user')
            .setParameters({user: id})
            .getOne();
        return (user);
        //return this.userRepository.findOneBy({id: id});
    }
}
