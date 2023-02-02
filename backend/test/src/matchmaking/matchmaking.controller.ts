import { Controller, Request, Req, Query, Param, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { MatchmakingGateway } from './matchmaking.gateway';

const { FifoMatchmaker } = require('matchmaking');

@Controller('play')
export class MatchmakingController {

    @Get('startmatchmaking')
    async createQueue(@Param('id') id: Readonly<string>): Promise<boolean> {
        function runGame(players) {
            console.log("Game started with:");
            console.log(players);
        }
        const { FifoMatchmaker } = require('matchmaking');
        let mm = new FifoMatchmaker(runGame, { checkInterval: 2000 });
        let player1 = { id:1 }
        let player2 = { id:2 }
        
        // Players join match queue
        mm.push(player1);
        mm.push(player2);
        return (true);
    }

}




