import { IsEmail, IsNotEmpty, IsNumber, MinLength } from "class-validator";

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
    username: string;

    @IsNotEmpty()
    token: string;
}