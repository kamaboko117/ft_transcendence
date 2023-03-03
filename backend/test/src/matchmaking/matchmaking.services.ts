import { Injectable } from '@nestjs/common';
import { User } from '../chat/chat.interface';



type Match = {
  player1id: string;
  player2id: string;
  status : number;
};

@Injectable()
export class MatchMakingService {

private memoryQueue: { [key: string]: User[] } = {};

  constructor() {}

  queuein(user: User) {
    //check if player is already in match
    //if not, add to match
    //if yes, throw error


    //check if player is already in queue
    //if not, add to queue
    //if yes, throw error

  }

  queueout(userId: number) {
    //check if player is in queue
    //if yes, remove from queue
    //if no, throw error

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

   

  private createMatch(player1: User, player2: User) {
    //create match
    //send match to both players
    //remove players from queue

  }
}
