import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
//import entities from './typeorm';
import { ChatModule } from './chat/chat.module';
import { SocketModule } from "./socket/socket.module";
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: "postgres",
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        //entities: entities,
        synchronize: true,
        autoLoadEntities: true
      }),
      inject: [ConfigService],
    }),
    UsersModule, ChatModule, SocketModule, AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
