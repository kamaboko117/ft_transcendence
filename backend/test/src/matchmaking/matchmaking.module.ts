import { Module } from '@nestjs/common';
import { MatchMakingGateway } from './matchmaking.gateway';

@Module({
  controllers: [],
  providers: [MatchMakingGateway],
  exports: [],
})
export class MatchMakingModule {}
