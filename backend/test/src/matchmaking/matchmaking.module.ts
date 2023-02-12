import { Module } from '@nestjs/common';
import { JWT } from '@nestjs/jwt';
import { MMGateway } from './match-making.gateway';

@Module({
  controllers: [],
  providers: [MMGateway, JWT],
  exports: [],
})
export class MatchMakingModule {}
