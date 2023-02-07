import { IsNotEmpty, IsNumber, MinLength } from "class-validator";

export class CreateRoomDto {
    
    @IsNotEmpty()
    @IsNumber()
    roomID: number;

    @IsNotEmpty()
    @MinLength(3)
    roomName: string;
}