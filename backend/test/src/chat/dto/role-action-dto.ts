import { IsDefined, IsIn, IsNumber, IsOptional, IsString } from "class-validator";

export class PostActionDto {
    @IsString()
    id: string;

    @IsString()
    @IsIn(["Grant", "Remove", "Ban", "Mute", "Kick"])
    action: string

    @IsOptional()
    @IsNumber()
    time: number;

    @IsNumber()
    userId: number;
}