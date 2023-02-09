import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
    Request
} from "@nestjs/common";
import { CreateUserDto } from "src/users/dto/users.dtos";
import { UsersService } from "src/users/services/users/users.service";
import { CustomAuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
//import {AuthGuard} from '@nestjs/passport';

@Controller("users")
export class UsersController {
    constructor(private readonly userService: UsersService,
        private authService: AuthService) { }

    @Get()
    getUsers() {
        return this.userService.getUsers();
    }

    @Get("id/:id")
    findUsersById(@Param("id", ParseIntPipe) id: number) {
        return this.userService.findUsersById(id);
    }
    /* authguard(strategy name) */
    @UseGuards(CustomAuthGuard)
    @Post('login')
    async login(@Request() req: any) {
        console.log("LOGIN POST");
        return (req.user);
    }

    @Get("validate/:code")
    validateUser(@Param("code") code: string) {
        console.log("CODE: " + code);
        return this.userService.validateUser(code);
    }

    @Post("create")
    @UsePipes(ValidationPipe)
    createUsers(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }
}
