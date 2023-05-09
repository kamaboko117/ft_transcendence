import { IsEmail, IsNotEmpty, IsNumber, MinLength,
    IsString, IsBoolean, IsDefined,
    IsObject, ValidateNested, MaxLength } from "class-validator";
import { Type } from 'class-transformer';

export class Username {
    @IsString()
    username: string
}

export class BlockUnblock {
    @IsNumber()
    userId: number;
    @IsNumber()
    type: number;
}

export class CreateUserDto {
    @IsNotEmpty()
    @IsNumber()
    userID: number;

    @IsNotEmpty()
    @MinLength(3)
    @IsString()
    username: string;

    @IsNotEmpty()
    token: string;
}

export class Code {
    @IsNumber()
    code: number;
}

export class UpdateUser {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    fa: string;
}

export class FirstConnection {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    fa: string;
}
