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
    Request, Res, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator
} from "@nestjs/common";
import { CreateUserDto, BlockUnblock } from "src/users/dto/users.dtos";
import { UsersService } from "src/users/services/users/users.service";
import { CustomAuthGuard } from 'src/auth/auth.guard';
import { FakeAuthGuard } from 'src/auth/fake.guard';
import { JwtGuard, Public } from 'src/auth/jwt.guard';
import { AuthService } from 'src/auth/auth.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { TokenUser } from "src/chat/chat.interface";

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
        return ({token: access_token, user_id: req.user.userID});
    }
    /* authguard(strategy name) */
    @Public()
    @UseGuards(FakeAuthGuard)
    @Get('fake-login')
    async fakeLogin(@Request() req: any, @Res({ passthrough: true }) response: any) {
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
        return ({token: access_token, user_id: req.user.userID});
    }

    @Post('avatarfile')
    @UseInterceptors(FileInterceptor('fileset', { dest: './upload_avatar' }))
    uploadFile(@Request() req: any, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 1000000 }),
            new FileTypeValidator({ fileType: 'image/png' }),
        ],
    }),
    ) file: Express.Multer.File) {
        const user = req.user;
        this.userService.updatePathAvatarUser(user.userID, file.path);
        return ({ path: file.path });
    }

    @Post('block-unblock')
    blockUnblockUser(@Request() req: any, @Body() Body: BlockUnblock) {
        const user: TokenUser = req.user;
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
    async getProfile(@Request() req: any) {
        console.log("call profile");
        console.log(req.user);
        const user: TokenUser = req.user;
        const ret_user = await this.userService.getUserProfile(user.userID);
        console.log("profile");
        console.log(ret_user);
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
