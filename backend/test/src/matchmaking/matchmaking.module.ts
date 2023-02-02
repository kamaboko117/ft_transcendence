import { Module } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { MatchmakingGateway } from './matchmaking.gateway';

@Module({
  providers: [MatchmakingGateway, MatchmakingService]
})
export class MatchmakingModule {}
