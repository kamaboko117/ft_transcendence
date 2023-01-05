import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "src/users/dto/users.dtos";
const validateURL = "https://api.intra.42.fr/oauth/token"
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
        return this.userRepository.save(newUser);
    }

    async validateUser(code: number) {
        const formData = new FormData();
        formData.append("grant_type", "authorization_code");
        formData.append("client_id", appId);
        formData.append("client_secret", appSecret);
        formData.append("code", String(code));
        formData.append("redirect_uri", "http://localhost:8080");

        const id = await fetch(validateURL, {
            method: "POST",
            headers: {
                "Content-Type": "form-data"
            },
            body: formData
        })
        console.log(id);
    }

    getUsers() {
        return this.userRepository.find();
    }

    findUsersById(id: number) {
        return this.userRepository.findOneBy({id: id});
    }
}
