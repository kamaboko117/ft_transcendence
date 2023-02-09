import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [UsersModule, PassportModule,
        JwtModule.register({
            secret: process.env.AUTH_SECRET,
            signOptions: { expiresIn: 60 }
        })],
    providers: [AuthService, LocalStrategy],
    exports: [AuthService]
})
export class AuthModule { }
