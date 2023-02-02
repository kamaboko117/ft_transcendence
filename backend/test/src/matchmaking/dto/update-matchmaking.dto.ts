import { PartialType } from '@nestjs/mapped-types';
import { CreateMatchmakingDto } from './create-matchmaking.dto';

export class UpdateMatchmakingDto extends PartialType(CreateMatchmakingDto) {
  id: number;
}
