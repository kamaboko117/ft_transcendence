import { IsBoolean, IsDefined, IsString } from "class-validator";

export class UpdateTypeRoom {
    @IsBoolean()
    type: boolean;
    @IsDefined()
    @IsString()
    roomId: string;
}
