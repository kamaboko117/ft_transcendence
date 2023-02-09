import { Module } from "@nestjs/common";
import { UsersController } from "./controllers/users/users.controller";
import { UsersService } from "./services/users/users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/typeorm";
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([User])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule { }
