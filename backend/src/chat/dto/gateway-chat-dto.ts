import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class StopEmit {
    @IsNotEmpty()
    @IsString()
    id: string;
}