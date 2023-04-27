import { IsBoolean, IsDefined, IsNumber, IsString } from "class-validator";

export class UpdateTypeRoom {
    @IsBoolean()
    type: boolean;
    @IsDefined()
    @IsString()
    roomId: string;
}

export class SizeBall {
    @IsNumber()
    size: string;
    @IsDefined()
    @IsString()
    roomId: string;
}

