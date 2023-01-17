import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "src/users/dto/users.dtos";
import { randomBytes } from "crypto";

const validateURL = "https://api.intra.42.fr/oauth/token"
const infoURL = "https://api.intra.42.fr/oauth/token/info"
const appId = process.env.APP_ID;
const appSecret = process.env.APP_SECRET;

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    createUser(createUserDto: CreateUserDto) {
        const newUser = this.userRepository.create(createUserDto);
        newUser.token = randomBytes(64).toString('hex');
        return this.userRepository.save(newUser);
    }

    async validateUser(code: string) {
        const formData = new FormData();
        formData.append("grant_type", "authorization_code");
        formData.append("client_id", appId);
        formData.append("client_secret", appSecret);
        formData.append("code", code);
        formData.append("redirect_uri", "http://localhost:8080/validate");
        formData.append("state", "pouet2");
        // console.log(formData);

        let res = await fetch(validateURL, {
            method: "POST",
            body: formData
        })
        // console.log(res);
        let resJSON = await res.json();
        const token = resJSON.access_token;
        console.log(`token: ${token}`);
        res = await fetch(infoURL, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        resJSON = await res.json();
        const id: number = resJSON.resource_owner_id;
        console.log(`id: ${id}`);
        const user = await this.userRepository.findOneBy({userID: id});
        if (user && user.username) {
            return [true, user];
        }
    
        return [false, id];
    }

    getUsers() {
        return this.userRepository.find();
    }

    findUsersById(id: number) {
        return this.userRepository.findOneBy({id: id});
    }
}
