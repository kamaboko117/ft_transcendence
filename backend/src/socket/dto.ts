import { IsBoolean, IsDefined, IsNumber, IsString } from "class-validator";

export class UpdateTypeRoom {
    @IsBoolean()
    type: boolean;
    @IsDefined()
    @IsString()
    roomId: string;
}



export class UserIdRdy {
    @IsBoolean()
    rdy: boolean;

    @IsDefined()
    @IsString()
    uid: string;

    @IsDefined()
    @IsString()
    usr1: string;

    @IsDefined()
    @IsString()
    usr2: string;

    @IsBoolean()
    custom: boolean;
}