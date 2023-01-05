import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { CreateUserDto } from "src/users/dto/users.dtos";
import { UsersService } from "src/users/services/users/users.service";

@Controller("users")
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Get()
    getUsers() {
        return this.userService.getUsers();
    }

    @Get("id/:id")
    findUsersById(@Param("id", ParseIntPipe) id: number) {
        return this.userService.findUsersById(id);
    }

    @Get("validate/:code")
    validateUser(@Param("code") code: string) {
        return this.userService.validateUser(code);
    }

    @Post("create")
    @UsePipes(ValidationPipe)
    createUsers(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }
}
