import { IsEmail, IsNotEmpty, IsNumber, MinLength } from "class-validator";

export class CreateUserDto {
    
    @IsNotEmpty()
    @IsNumber()
    userID: number;

    @IsNotEmpty()
    @MinLength(3)
    username: string;

    @IsNotEmpty()
    token: string;
    // @IsNotEmpty()
    // @MinLength(8)
    // password: string;

    // @IsNotEmpty()
    // @IsEmail()
    // email: string;
}
