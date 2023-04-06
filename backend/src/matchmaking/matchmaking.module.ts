import { Module } from '@nestjs/common';
import { MatchMakingGateway } from './matchmaking.gateway';
import { MatchMakingService } from './matchmaking.services';

@Module({
  controllers: [],
  providers: [MatchMakingGateway, MatchMakingService],
  exports: [],
})
export class MatchMakingModule {}
