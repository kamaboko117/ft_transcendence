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
    Request, Res, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, NotFoundException, UnauthorizedException, HttpException, HttpStatus, Query, BadRequestException
} from "@nestjs/common";
import { CreateUserDto, BlockUnblock, UpdateUser, Username, FirstConnection, Code } from "src/users/dto/users.dtos";
import { UsersService } from "src/users/providers/users/users.service";
import { CustomAuthGuard } from 'src/auth/auth.guard';
import { FakeAuthGuard } from 'src/auth/fake.guard';
import { JwtGuard, Public } from 'src/auth/jwt.guard';
import { JwtFirstGuard } from 'src/auth/jwt-first.guard';
import { AuthService } from 'src/auth/auth.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { TokenUser } from "src/chat/chat.interface";
import { BlackFriendList } from "src/typeorm/blackFriendList.entity";
import { MatchHistory } from "src/typeorm/matchHistory.entity";
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import * as bcrypt from 'bcrypt';

@Controller("users")
export class UsersController {
    constructor(private readonly userService: UsersService,
        private authService: AuthService) { }

    @Public()
    @UseGuards(JwtFirstGuard)
    @Get('set-fa')
    async setFa(@Request() req: any) {
        const user: TokenUser = req.user;
        const userDb = await this.userService.getUserFaSecret(user.userID);

        if (!userDb || !userDb?.username) {
            throw new NotFoundException("Username not found");
        }
        if (userDb.fa === false
            || userDb.secret_fa === null || userDb.secret_fa === "")
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (userDb.fa_first_entry === true)
            return ({ code: 3, url: null });
        const otpAuth = authenticator.keyuri(userDb.username, "ft_transcendence", userDb.secret_fa);
        const url = await toDataURL(otpAuth);
        if (url)
            return ({ code: 2, url: url });
        return ({ code: 1, url: null });
    }

    @Public()
    @UseGuards(JwtFirstGuard)
    @Get('check-fa')
    async checkFa(@Request() req: any) {
        const user: TokenUser = req.user;
        const userDb = await this.userService.getUserFaSecret(user.userID);

        if (!userDb?.username) {
            throw new NotFoundException("Username not found");
        }
        if (userDb.fa === false
            || userDb.secret_fa === null || userDb.secret_fa === "")
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (user.fa_code != "")
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    /* get fa code and set it to new jwt token */
    @Public()
    @UseGuards(JwtFirstGuard)
    @Post('valid-fa-code')
    async validFaCode(@Request() req: any, @Body() body: Code) {
        let user: TokenUser = req.user;
        const userDb = await this.userService.getUserFaSecret(user.userID);
        let isValid = false;
        let access_token = { access_token: "" }
        if (!userDb?.username) {
            throw new NotFoundException("Username not found");
        }
        try {
            if (!isNaN(body.code)) {
                //check if code already used, if yes then error
                if (userDb.fa_psw != null) {
                    const ret = await bcrypt.compare(String(body.code), userDb.fa_psw);
                    if (ret === true)
                        return ({ valid: false, username: userDb.username, token: null });
                }
                //check if code is valid with authenticator module
                isValid = authenticator.verify({ token: String(body.code), secret: userDb.secret_fa });
                if (isValid) {
                    user.fa_code = String(body.code);
                    const salt = Number(process.env.SALT);
                    //must hash code into db
                    bcrypt.hash(user.fa_code, salt, ((err, psw) => {
                        if (!err && psw)
                            this.userService.update2FaPsw(user.userID, psw);
                        else
                            throw new NotFoundException("Authenticator code verification failed");
                    }));
                    //register user used a code in db, like this, we can't register again the qr code
                    this.userService.updateFaFirstEntry(user.userID);
                    access_token = await this.authService.login(user);
                    return ({ valid: isValid, username: userDb.username, token: access_token });
                }
                return ({ valid: false, username: userDb.username, token: null });
            }
        } catch (e) {
            throw new BadRequestException("Something went wrong");
        }
        return ({ valid: isValid, username: userDb.username, token: null });
    }

    /* authguard(strategy name) */
    @Public()
    @UseGuards(FakeAuthGuard)
    @Get('fake-login')
    async fakeLogin(@Request() req: any, @Res({ passthrough: true }) response: any) {
        let user: TokenUser = req.user;
        user.fa_code = "";
        console.log("FAKE LOGIN")
        console.log(user)
        const access_token = await this.authService.login(user);
        const refresh = await this.authService.refresh(user);

        response.cookie('refresh_token', refresh.refresh_token,
            {
                maxAge: 300000,
                httpOnly: true,
                sameSite: 'Strict',
            });
        return ({
            token: access_token, user_id: req.user.userID,
            username: user.username, fa: user.fa
        });
    }

    checkUpdateUserError(ret_user: any, ret_user2: any,
        body: any) {
        let err: string[] = [];
        const regex2 = /^[\w\d]{3,}$/;
        const regexRet2 = regex2.test(body.username);

        if (24 < body.username.length)
            err.push("Username is too long");
        if (body.username.length === 0)
            err.push("Username can't be empty");
        if (body.username.length < 4 && body.username.length != 0)
            err.push("Username is too short");
        //check if username is already used, and if this not the self user
        if (ret_user && ret_user2) {
            if (ret_user2.userID != ret_user.userID)
                if (ret_user.username === body.username)
                    err.push("Username is already used");
        }
        if (regexRet2 === false)
            err.push("Username format is wrong, please use alphabet and numerics values");
        return (err);
    }

    @Post('update-user')
    @UseInterceptors(FileInterceptor('fileset', { dest: './upload_avatar' }))
    async updateUser(@Request() req: any, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 1000000 }),
            new FileTypeValidator({ fileType: /^image\/(png|jpg|jpeg)$/ }),
        ], fileIsRequired: false
    }),
    ) file: Express.Multer.File | undefined, @Body() body: UpdateUser) {
        console.log("Heheh");
        let user: TokenUser = req.user;
        const ret_user = await this.userService.findUserByName(body.username);
        let ret_user2 = await this.userService.findUsersById(user.userID);
        //check errors
        let retErr = this.checkUpdateUserError(ret_user,
            ret_user2, body);

        if (retErr.length != 0)
            return ({ valid: false, err: retErr });
        //update avatar
        if (file)
            await this.userService.updatePathAvatarUser(user.userID, file.path);
        //need to update username token, for new login
        if (body.username !== "")
            user.username = body.username;
        else if (ret_user2)
            user.username = ret_user2.username;
        //update username
        if (body.username && body.username != "")
            this.userService.updateUsername(user.userID, body.username);
        //check if 2FA is used by requested user
        const regex1 = /^({"fa":true})$/;
        const regexRet = body.fa.match(regex1);
        if (regexRet && ret_user2?.fa === false) {
            //generate new auth secret
            user.fa = true;
            user.fa_code = "";
            this.userService.update2FA(user.userID, true, authenticator.generateSecret());
        }
        else if (!regexRet) {
            user.fa = false;
            user.fa_code = "";
            this.userService.update2FA(user.userID, false, null);
        }
        //need to generate new login token
        const access_token = await this.authService.login(user);
        if (file)
            ret_user2 = await this.userService.findUsersById(user.userID);
        return ({
            valid: true, username: user.username,
            token: access_token, img: ret_user2?.avatarPath
        });
    }

    @Public()
    @UseGuards(JwtFirstGuard)
    @Post('firstlogin')
    @UseInterceptors(FileInterceptor('fileset', { dest: './upload_avatar' }))
    async uploadFirstLogin(@Request() req: any, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 1000000 }),
            new FileTypeValidator({ fileType: /^image\/(png|jpg|jpeg)$/ }),
        ], fileIsRequired: false
    }),
    ) file: Express.Multer.File | undefined, @Body() body: FirstConnection) {
        let user = req.user;
        const ret_user = await this.userService.getUserProfile(user.userID);
        const ret_user2 = await this.userService.findUserByName(body.username);

        let retErr = this.checkUpdateUserError(ret_user2,
            ret_user, body);

        if (retErr.length != 0)
            return ({ valid: false, err: retErr });
        const regex1 = /^({"fa":true})$/;
        const regexRet = body.fa.match(regex1);
        if (file)
            this.userService.updatePathAvatarUser(user.userID, file.path);
        this.userService.updateUsername(user.userID, body.username);
        if (regexRet) {
            //generate new auth secret
            this.userService.update2FA(user.userID, true, authenticator.generateSecret());
            user.fa = true;
            user.fa_code = "";
        }
        user.username = body.username;
        const access_token = await this.authService.login(user);
        return ({ valid: true, username: body.username, token: access_token });
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
        const user: TokenUser = req.user;
        this.userService.updatePathAvatarUser(user.userID, file.path);
        return ({ path: file.path });
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
        return (ret_user);
    }

    /* special function, to check username and 2FA for first connection */
    @Public()
    @UseGuards(JwtFirstGuard)
    @Get('first-profile')
    async firstConnectionProfile(@Request() req: any) {
        const user: TokenUser = req.user;
        const ret_user = await this.userService.getUserProfile(user.userID);
        return (ret_user);
    }

    /* get info focus user with friend and block list from requested user*/
    @Get('info-fr-bl')
    async getUserInfo(@Request() req: any,
        @Query('name') name: string) {
        const user: TokenUser = req.user;
        const ret_user = await this.userService.findUserByName(name);

        if (!ret_user)
            return ({ valid: false });
        let info = await this.userService.focusUserBlFr(user.userID, Number(ret_user?.userID));
        if (!info) {
            return ({
                valid: true, id: ret_user.userID,
                User_username: ret_user.username, fl: null,
                bl: null
            })
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

    @Get('get-victory-nb')
    async getNbVictory(@Request() req: any) {
        const user: TokenUser = req.user;
        const ret_nb = await this.userService.getVictoryNb(user.userID);
        return (ret_nb);
    }

    @Get('get-games-nb')
    async getNbGames(@Request() req: any) {
        const user: TokenUser = req.user;
        const ret_nb = await this.userService.getGamesNb(user.userID);
        return(ret_nb);
    }

    @Get('get_raw_mh')
    async getMHRaw(@Request() req: any) {
        const user: TokenUser = req.user;
        const ret_raw = await this.userService.getRawMH(user.userID);
        return (ret_raw);
    }

    @Get('get_raw_mh_user')
    async getMHRawTwo(@Param('id', ParseIntPipe) id: number) {
        const ret_raw = await this.userService.getRawMH(id);
        return (ret_raw);
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
            return ({ code: 0 });
        else if (Number(ret_user.userID) == user.userID)
            return ({ code: 2 });
        const findInList = await this.userService.searchUserInList(user.userID, ret_user.userID, 2);
        console.log(findInList);
        if (findInList)
            return ({ code: 1 });
        this.userService.insertBlFr(user.userID, Number(ret_user.userID), 2);
        //need to check if user is in BL, for updating global friend black list
        const findInBlackList = await this.userService.searchUserInList(user.userID, ret_user.userID, 1);
        if (findInBlackList) {
            return ({
                code: 3, id: Number(ret_user.userID),
                fl: 2, bl: 1,
                User_username: ret_user.username, User_avatarPath: ret_user.avatarPath
            });
        }
        return ({
            code: 3, id: Number(ret_user.userID),
            fl: 2, bl: 0,
            User_username: ret_user.username, User_avatarPath: ret_user.avatarPath
        });
    }

    @Post('add-blacklist')
    async addBlackList(@Request() req: any, @Body() body: Username) {
        const user: TokenUser = req.user;

        const ret_user = await this.userService.findUserByName(body.username);
        if (!ret_user)
            return ({ code: 0 });
        else if (Number(ret_user.userID) == user.userID)
            return ({ code: 2 });
        const findInList = await this.userService.searchUserInList(user.userID, ret_user.userID, 1);
        console.log(findInList);
        if (findInList)
            return ({ code: 1 });
        this.userService.insertBlFr(user.userID, Number(ret_user.userID), 1);
        //need to check if user is in BL, for updating global friend black list
        const findInBlackList = await this.userService.searchUserInList(user.userID, ret_user.userID, 2);
        if (findInBlackList) {
            return ({
                code: 3, id: Number(ret_user.userID),
                fl: 2, bl: 1,
                User_username: ret_user.username, User_avatarPath: ret_user.avatarPath
            });
        }
        return ({
            code: 3, id: Number(ret_user.userID),
            fl: 2, bl: 0,
            User_username: ret_user.username, User_avatarPath: ret_user.avatarPath
        });
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
        console.log("LOGIN")
        console.log(user)
        const access_token = await this.authService.login(user);
        const refresh = await this.authService.refresh(user);

        response.cookie('refresh_token', refresh.refresh_token,
            {
                maxAge: 300000,
                httpOnly: true,
                sameSite: 'Strict',
            });
        return ({
            token: access_token, user_id: req.user.userID,
            username: user.username, fa: user.fa
        });
    }

    @Post('create')
    @UsePipes(ValidationPipe)
    createUsers(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }

    @Get(':id')
    async findUsersById(@Param('id', ParseIntPipe) id: number) {
        const user = await this.userService.findUsersById(id);
        if (!user)
            return ({ userID: 0, username: "", avatarPath: null, sstat: {} });
        return (user)
    }
}