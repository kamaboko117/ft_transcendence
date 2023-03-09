import { Injectable } from '@nestjs/common';
import { TokenUser } from '../chat/chat.interface';
import { Server } from 'socket.io';

const { FifoMatchmaker } = require('matchmaking');


type Match = {
  player1id: string;
  player2id: string;
  status : number;
};

@Injectable()
export class MatchMakingService {

private mmQueue: { [key: string]: TokenUser[] } = {};
private mm = new FifoMatchmaker(this.runGame, { checkInterval: 2000 });

  runGame(players : any) {
   console.log("Game started with:");
   console.log(players);
  }

  constructor() {}

  private createMatch(player1: TokenUser, player2: TokenUser) {
    //create match if handmade here?
    //send match to both players
    //remove players from queue

  }

/*
  user rejoint room de socket
  faire
  server.to(user.room).emit('message', { user: user.name, text: message });
*/
  queuein(user: TokenUser, socket: Readonly<any>, server: Server) {
    //check if player is already in match
    //if not, add to match
    //if yes, throw error
    console.log(server.sockets.adapter.rooms);
    //check if player is already in queue
    //if not, add to queue
    //if yes, throw error
  
    this.mm.push(user.userID);
  }

  queueout(user: TokenUser) {
    //check if player is in queue
    //if yes, remove from queue
    //if no, throw error
    this.mm.leaveQueue(user.userID);
  }

  async acceptMatch(user: TokenUser) {
    //check if player is in match
    //if yes, change match status to accepted
    //if no, throw error


  }

  declineMatch(user: TokenUser) {
    //check if player is in made match
    //if yes, change match status to declined
    //if no, throw error
    
  }

  private bothcheck(player1: TokenUser, player2: TokenUser) {
    //check if both players are accepted
    //if yes, return true
    //if no, return false
  }
}
