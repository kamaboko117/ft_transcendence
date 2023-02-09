import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

//fowardRef = circular dependence
@Module({
    imports: [forwardRef(() => UsersModule), PassportModule,
    JwtModule.register({
        secret: process.env.AUTH_SECRET,
        signOptions: { expiresIn: 300 }
    })],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService]
})
export class AuthModule { }
