import { IsEmail, IsNotEmpty, IsNumber, MinLength,
    IsString, IsBoolean, IsDefined,
    IsObject, ValidateNested } from "class-validator";
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

/*class Fa {
    @IsBoolean()
    fa: boolean;
}*/

export class UpdateUser {
	@MaxLength(24)
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    fa: string;
}

export class FirstConnection {
	@MaxLength(24)
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    fa: string;
}
