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
import { CreateUserDto, BlockUnblock, UpdateUser } from "src/users/dto/users.dtos";
import { UsersService } from "src/users/services/users/users.service";
import { CustomAuthGuard } from 'src/auth/auth.guard';
import { FakeAuthGuard } from 'src/auth/fake.guard';
import { JwtGuard, Public } from 'src/auth/jwt.guard';
import { AuthService } from 'src/auth/auth.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { TokenUser } from "src/chat/chat.interface";
import { BlackFriendList } from "src/typeorm/blackFriendList.entity";

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
        return ({ token: access_token, user_id: req.user.userID });
    }

    @Post('update-user')
    @UseInterceptors(FileInterceptor('fileset', {dest: './upload_avatar'}))
    updateUser(@Request() req: any, @UploadedFile(new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({ fileType: 'image/png'}),
        ], fileIsRequired: false
      }),
    ) file: Express.Multer.File | undefined, @Body() body: UpdateUser) {
        const user = req.user;
        console.log(body);
        //body.fa must accept the regex
        //if regex not ok, then return NULL so no FA accepted
        const stringRegex = /^({"fa":true})$/g;
        const regex = stringRegex;
        const regexRet = body.fa.match(regex);
        console.log(regexRet);
        if (file)
            this.userService.updatePathAvatarUser(user.userID, file.path);
        if (body.username && body.username != "")
            this.userService.updateUsername(user.userID, body.username);
        if (regexRet)
            this.userService.update2FA(user.user_id, true);
        else
            this.userService.update2FA(user.user_id, false);
            // this.userService.faire une fonction dans le service pour mettre a jour l username et 2FA via typeorm
        return ({valid: true});
    }

    @Post('firstlogin')
    @UseInterceptors(FileInterceptor('fileset', {dest: './upload_avatar'}))
    uploadFirstLogin(@Request() req: any, @UploadedFile(new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({ fileType: 'image/png'}),
        ], fileIsRequired: false
      }),
    ) file: Express.Multer.File | undefined, @Body() body: UpdateUser) {
        const user = req.user;
        console.log(body);
        if (body.username && body.username == "") {
            return ({valid: false});
        }
        //body.fa must accept the regex
        //if regex not ok, then return NULL so no FA accepted
        const stringRegex = /^({"fa":true})$/g;
        const regex = stringRegex;
        const regexRet = body.fa.match(regex);
        console.log(regexRet);
        if (file)
            this.userService.updatePathAvatarUser(user.userID, file.path);
        this.userService.updateUsername(user.userID, body.username);
        if (regexRet)
            this.userService.update2FA(user.user_id, true);
        // this.userService.faire une fonction dans le service pour mettre a jour l username et 2FA via typeorm
        return ({valid: true});
    }

    @Post('avatarfile')
    @UseInterceptors(FileInterceptor('fileset', {dest: './upload_avatar'}))
    uploadFile(@Request() req: any, @UploadedFile(new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({ fileType: 'image/png'}),
        ],
      }),
    ) file: Express.Multer.File) {
        const user = req.user;
        this.userService.updatePathAvatarUser(user.userID, file.path);
        return ({path: file.path});
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

    @Get('fr-bl-list')
    async getFriendBlackListUser(@Request() req: any) {
        const user: TokenUser = req.user;
        return (await this.userService.getBlackFriendListBy(user.userID));
    }

    @Post('fr-bl-list')
    async useBlackFriendList(@Request() req: any, @Body() body: BlockUnblock) {
        const user: TokenUser = req.user;
        const find: BlackFriendList | null = await this.userService.findBlFr(user.userID, body.userId, body.type);

        if (user.userID === body.userId)
            return ({ add: false, type: null });
        if (find) {
            //delete
            this.userService.deleteBlFr(user.userID, body.userId, body.type, find.id);
            return ({ add: false, type: body.type });
        }
        else {
            //insert
            this.userService.insertBlFr(user.userID, body.userId, body.type);
        }
        return ({ add: true, type: body.type });
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
                httpOnly: true,
                sameSite: 'Strict'
            });
        return ({ token: access_token, user_id: req.user.userID });
    }

    @Post("create")
    @UsePipes(ValidationPipe)
    createUsers(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }
}
