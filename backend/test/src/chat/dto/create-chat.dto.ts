import { IsString, IsInt, IsArray, ValidateNested, IsObject, IsDefined, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

/* Pair for ban and mute */
/*class Pair {
    @IsString()
    key: string;
    @IsNumber()
    value: number
}*/
/*@IsDefined()
 @IsObject()
 @ValidateNested()
 @Type(() => Pair)
 setMute: Pair;
 @IsDefined()
 @IsObject()
 @ValidateNested()
 @Type(() => Pair)
 setBan: Pair;*/

export class Owner {
    @IsString()
    idUser: number;
    @IsString()
    username: string | undefined
}

export class CreateChatDto {
    @IsString()
    id: string;
    @IsString()
    name: string;
    //@IsInt()
    //owner: number;
    //@IsObject()
    //@IsDefined()
    //@ValidateNested()
    //@Type(() => Owner)
    //owner: Owner;
    @IsString()
    accesstype: string;
    @IsString()
    password: string;
    @IsArray()
    lstMsg: Array<{
        user_id: number,
        username: string, //à enlever pour un find dans repository
        content: string
    }>;
    @IsDefined()
    @ValidateNested()
    @Type(() => Map<string, string>)
    lstUsr: Map<number | string, string>
    @IsDefined()
    @ValidateNested()
    @Type(() => Map<string, number>)
    lstMute: Map<string, number>;
    @IsDefined()
    @ValidateNested()
    @Type(() => Map<string, number>)
    lstBan: Map<string, number>;
}

