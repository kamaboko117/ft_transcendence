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
    Request, Res
} from "@nestjs/common";
import { CreateUserDto } from "src/users/dto/users.dtos";
import { UsersService } from "src/users/services/users/users.service";
import { CustomAuthGuard } from 'src/auth/auth.guard';
import { JwtGuard, Public } from 'src/auth/jwt.guard';
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
    @Public()
    @UseGuards(CustomAuthGuard)
    @Post('login')
    async login(@Request() req: any, @Res({ passthrough: true }) response: any) {
        console.log("LOGIN POST");
        const access_token = await this.authService.login(req.user);
        const refresh = await this.authService.refresh(req.user);
        console.log(access_token);
        console.log(refresh);
        response.cookie('refresh_token', refresh.refresh_token,
            {
                maxAge: 300000,
                httpOnly: true
            });
        return (access_token);
    }

    /*
        useGuard est un middleware
        le middleware peut traiter les requetes et les reponses
        avant d'aller dans la fonction souhaite (getProfile ici)
        UseGuard va utiliser le middleware
        JwtGuard qui valide le token recu
        si FAUX, s'arrete la et ne va pas dans getProfile
        si bon, le guard JwtGuard va passer a la suite,
        la strategy jwt lui va decoder le Json web token (jwt)
        et renvoyer le token decoder
        (ici utilise uniquement req.user.userID)
        ce token decoder sera ajouter a la requete utilisateur
        (ici @Request() req: any)
    */
    @UseGuards(JwtGuard)
    @Get('profile')
    getProfile(@Request() req: any) {
        console.log("call profile");
        console.log(req.user);
        const user: {userID: number,
            token: string,
            username: string} = req.user;
        const ret_user = this.userService.findUsersById(user.userID)
        
        return (ret_user);
    }

    @Get("validate/:code")
    validateUser(@Param("code") code: string) {
        console.log("CODE: " + code);
        //return this.userService.validateUser(code);
    }

    @Post("create")
    @UsePipes(ValidationPipe)
    createUsers(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }
}
