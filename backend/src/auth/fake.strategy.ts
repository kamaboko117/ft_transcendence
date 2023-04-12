import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

//type Code = {
//  code: string
//}

@Injectable()
export class FakeStrategy extends PassportStrategy(Strategy, "fake-custom") {
    constructor(private authService: AuthService) {
        super();
    }

    async validate(req: any): Promise<any> {
        const user = await this.authService.fakeUser();
        if (!user || typeof user == "undefined")
            throw new UnauthorizedException();
        //must return User
        return (user);
    }
}
