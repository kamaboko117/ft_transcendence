import { IsNotEmpty, IsNumber, MinLength } from "class-validator";

export class CreateRoomDto {
    @IsNotEmpty()
    @MinLength(3)
    roomName: string;
}