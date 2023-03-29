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
    Request, Res, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, NotFoundException, UnauthorizedException, HttpException, HttpStatus, Query
} from "@nestjs/common";
import { CreateUserDto, BlockUnblock, UpdateUser, Username, FirstConnection, Code } from "src/users/dto/users.dtos";
//import { UsersService } from "src/users/services/users/users.service";
import { UsersService } from "src/users/providers/users/users.service";
import { CustomAuthGuard } from 'src/auth/auth.guard';
import { FakeAuthGuard } from 'src/auth/fake.guard';
import { JwtGuard, Public } from 'src/auth/jwt.guard';
import { JwtFirstGuard } from 'src/auth/jwt-first.guard';
import { AuthService } from 'src/auth/auth.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { TokenUser } from "src/chat/chat.interface";
import { BlackFriendList } from "src/typeorm/blackFriendList.entity";
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

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

    @Public()
    @UseGuards(JwtFirstGuard)
    @Get('set-fa')
    async setFa(@Request() req: any) {
        const user: TokenUser = req.user;
        const userDb = await this.userService.getUserFaSecret(user.userID);

        if (!userDb?.username) {
            throw new NotFoundException("Username not found");
        }
        if (userDb.fa === false
            || userDb.secret_fa === null || userDb.secret_fa === "")
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        const otpAuth = authenticator.keyuri(userDb.username, "ft_transcendence", userDb.secret_fa);
        const url = await toDataURL(otpAuth);
        if (url)
            return ({code: 2, url: url});
        return ({code: 1, url: null});
    }

    /* get fa code and set it to new jwt token */
    @Public()
    @UseGuards(JwtFirstGuard)
    @Post('valid-fa-code')
    async validFaCode(@Request() req: any, @Body() body: Code) {
        let user: TokenUser = req.user;
        const userDb = await this.userService.getUserFaSecret(user.userID);
        let isValid = false;
        let access_token = {access_token: ""}
        if (!userDb?.username) {
            throw new NotFoundException("Username not found");
        }
        try {
            if (!isNaN(body.code)) {
                isValid = authenticator.verify({token: String(body.code), secret: userDb.secret_fa});
                if (isValid) {
                    user.fa_code = String(body.code);
                    access_token = await this.authService.login(user);
                    return ({valid: isValid, username: userDb.username, token: access_token});
                }   
            }
        } catch (e) {
            throw new NotFoundException("Authenticator code verification failed");
        }
        // this.userService.faire une fonction dans le service pour mettre a jour l username et 2FA via typeorm
        return ({valid: isValid, username: userDb.username, token: null});
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
    async updateUser(@Request() req: any, @UploadedFile(new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({ fileType: 'image/png'}),
        ], fileIsRequired: false
      }),
    ) file: Express.Multer.File | undefined, @Body() body: UpdateUser) {
        const user: TokenUser = req.user;
        console.log(body);
        //body.fa must accept the regex
        //if regex not ok, then return NULL so no FA accepted
        const stringRegex = /^({"fa":true})$/g;
        const regex = stringRegex;
        const regexRet = body.fa.match(regex);
        console.log(regexRet);
        const ret_user = await this.userService.findUserByName(user.username);
        if (ret_user?.username === body.username)
            return ({valid: false});
        if (file)
            this.userService.updatePathAvatarUser(user.userID, file.path);
        if (body.username && body.username != "")
            this.userService.updateUsername(user.userID, body.username);
        if (regexRet)
            this.userService.update2FA(user.userID, true, authenticator.generateSecret());
        else
            this.userService.update2FA(user.userID, false, null);
            // this.userService.faire une fonction dans le service pour mettre a jour l username et 2FA via typeorm
        return ({valid: true});
    }

    @Public()
    @UseGuards(JwtFirstGuard)
    @Post('firstlogin')
    @UseInterceptors(FileInterceptor('fileset', {dest: './upload_avatar'}))
    async uploadFirstLogin(@Request() req: any, @UploadedFile(new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({ fileType: 'image/png'}),
        ], fileIsRequired: false
      }),
    ) file: Express.Multer.File | undefined, @Body() body: FirstConnection) {
        const user = req.user;
        console.log(body);
        const ret_user = await this.userService.getUserProfile(user.userID);
        if (body.username && body.username == "" || (ret_user && ret_user.username != "")) {
            return ({valid: false, username: ""});
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
        console.log(regexRet?.length)
        if (regexRet) {
            //generate new auth secret
            this.userService.update2FA(user.userID, true, authenticator.generateSecret());
            user.fa = true;
            user.fa_code = "";
        }
        user.username = body.username;
        const access_token = await this.authService.login(user);
        // this.userService.faire une fonction dans le service pour mettre a jour l username et 2FA via typeorm
        return ({valid: true, username: body.username, token: access_token});
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
        const user: TokenUser = req.user;
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
        const user: TokenUser = req.user;
        const ret_user = await this.userService.getUserProfile(user.userID);
        console.log("profile");
        console.log(ret_user);
        return (ret_user);
    }
    
    /* special function, to check username and 2FA for first connection */
    @Public()
    @UseGuards(JwtFirstGuard)
    @Get('first-profile')
    async firstConnectionProfile(@Request() req: any) {
        const user: TokenUser = req.user;
        const ret_user = await this.userService.getUserProfile(user.userID);
        console.log("profile");
        console.log(ret_user);
        return (ret_user);
    }

    /* get info focus user with friend and block list from requested user*/
    @Get('info-fr-bl')
    async getUserInfo(@Request() req: any,
        @Query('name') name: Readonly<string>) {
        const user: TokenUser = req.user;
        const ret_user = await this.userService.findUserByName(name);

        if (!ret_user)
            return ({valid: false});
        let info = await this.userService.focusUserBlFr(user.userID, Number(ret_user?.userID));
        if (!info) {
            return ({valid: true, id: ret_user.userID,
                User_username: ret_user.username, fl: null,
                bl: null})
        }
        info.valid = true;
        return (info);
    }

    @Get('fr-bl-list')
    async getFriendBlackListUser(@Request() req: any) {
        const user: TokenUser = req.user;
        const getBlFr: BlackFriendList[] = await this.userService.getBlackFriendListBy(user.userID)
        return (getBlFr);
    }

    @Get('get-username')
    async getUsername(@Request() req: any) {
        const user: TokenUser = req.user;
        const ret_user = await this.userService.findUserByName(user.username);
        return (ret_user);
    }


    /* 0 = user not found */
    /* 1 = already added in friend list */
    /* 2 = user is self */
    /* 3 = ok */
    @Post('add-friend')
    async addFriend(@Request() req: any, @Body() body: Username) {
        const user: TokenUser = req.user;

        const ret_user = await this.userService.findUserByName(body.username);
        if (!ret_user)
            return ({code: 0});
        else if (Number(ret_user.userID) == user.userID)
            return ({code: 2});
        const findInList = await this.userService.searchUserInList(user.userID, ret_user.userID, 2);
        console.log(findInList);
        if (findInList)
            return ({code: 1});
        this.userService.insertBlFr(user.userID, Number(ret_user.userID), 2);
        //need to check if user is in BL, for updating global friend black list
        const findInBlackList = await this.userService.searchUserInList(user.userID, ret_user.userID, 1);
        if (findInBlackList)
        {
            return ({ code: 3, id: Number(ret_user.userID),
                fl: 2, bl: 1,
                User_username: ret_user.username});
        }
        return ({ code: 3, id: Number(ret_user.userID),
            fl: 2, bl: 0,
            User_username: ret_user.username});
    }

    @Post('add-blacklist')
    async addBlackList(@Request() req: any, @Body() body: Username) {
        const user: TokenUser = req.user;

        const ret_user = await this.userService.findUserByName(body.username);
        if (!ret_user)
            return ({code: 0});
        else if (Number(ret_user.userID) == user.userID)
            return ({code: 2});
        const findInList = await this.userService.searchUserInList(user.userID, ret_user.userID, 1);
        console.log(findInList);
        if (findInList)
            return ({code: 1});
        this.userService.insertBlFr(user.userID, Number(ret_user.userID), 1);
        //need to check if user is in BL, for updating global friend black list
        const findInBlackList = await this.userService.searchUserInList(user.userID, ret_user.userID, 2);
        if (findInBlackList)
        {
            return ({ code: 3, id: Number(ret_user.userID),
                fl: 2, bl: 1,
                User_username: ret_user.username});
        }
        return ({ code: 3, id: Number(ret_user.userID),
            fl: 2, bl: 0,
            User_username: ret_user.username});
    }

    @Post('fr-bl-list')
    async useBlackFriendList(@Request() req: any, @Body() body: BlockUnblock) {
        const user: TokenUser = req.user;
        const find: BlackFriendList | null
            = await this.userService.findBlFr(user.userID, body.userId, body.type);
        if (user.userID === body.userId)
            return ({ add: false, type: null });
        if (find) {
            //deletes
            this.userService.deleteBlFr(user.userID, body.userId, body.type, find.id);
            return ({ add: false, type: body.type });
        }
        else {
            //insert
            console.log("insert")
            this.userService.insertBlFr(user.userID, body.userId, body.type);
        }
        return ({ add: true, type: body.type });
    }

    /* authguard(strategy name) */
    @Public()
    @UseGuards(CustomAuthGuard)
    @Post('login')
    async login(@Request() req: any, @Res({ passthrough: true }) response: any) {
        let user: TokenUser = req.user;
        user.fa_code = "";
        const access_token = await this.authService.login(user);
        const refresh = await this.authService.refresh(user);
       
        response.cookie('refresh_token', refresh.refresh_token,
            {
                maxAge: 300000,
                httpOnly: true,
                sameSite: 'Strict'
            });
        return ({ token: access_token, user_id: req.user.userID,
            username: user.username, fa: user.fa});
    }

    @Post("create")
    @UsePipes(ValidationPipe)
    createUsers(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }

    
}
