import { Injectable } from '@nestjs/common';
import { User } from '../chat/chat.interface';

const { FifoMatchmaker } = require('matchmaking');


type Match = {
  player1id: string;
  player2id: string;
  status : number;
};

@Injectable()
export class MatchMakingService {

private mmQueue: { [key: string]: User[] } = {};
private mm = new FifoMatchmaker(this.runGame, { checkInterval: 2000 });

  runGame(players : any) {
   console.log("Game started with:");
   console.log(players);
  }

  constructor() {}

  private createMatch(player1: User, player2: User) {
    //create match if handmade here?
    //send match to both players
    //remove players from queue

  }


  queuein(user: User) {
    //check if player is already in match
    //if not, add to match
    //if yes, throw error


    //check if player is already in queue
    //if not, add to queue
    //if yes, throw error
  
    this.mm.push(user.userID);
  }

  queueout(user: User) {
    //check if player is in queue
    //if yes, remove from queue
    //if no, throw error
    this.mm.leaveQueue(user.userID);
  }

  async acceptMatch(user: User) {
    //check if player is in match
    //if yes, change match status to accepted
    //if no, throw error


  }

  declineMatch(user: User) {
    //check if player is in made match
    //if yes, change match status to declined
    //if no, throw error
    
  }

  private bothcheck(player1: User, player2: User) {
    //check if both players are accepted
    //if yes, return true
    //if no, return false
  }
}
