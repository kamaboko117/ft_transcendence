import { SocketContext } from '../../contexts/Socket';
import React, { useEffect, useRef, MutableRefObject, useState, useContext } from 'react';


export class MMClass {
  private MMSocket?: Socket;
  private readonly MMnamespace = "matchmaking";
  //JWT token stuffs? local storage?

  constructor() {
    const url = `${import.meta.env.VITE_APP_URI}/${this.MMnamespace}`;
    this.MMSocket = useContext(SocketContext);
  }

  getMMSocket() {
    return this.MMSocket;
  }

  private connect2Back() {
    this.MMSocket?.on("connect", () => {
      console.log(`connect MM`);
    });

    this.MMSocket?.on("disconnect", () => {
      console.log(`disconnect MM`);
    });
  }
  acceptMatch() {
    this.MMSocket?.emit("acceptMMmatch");
  }

  declineMatch() {
    this.MMSocket?.emit("declineMMmatch");
  }

  findMatch() {
    console.log("queue in");
    this.MMSocket?.emit("queuein");
  }

  stopFindingMatch() {
    this.MMSocket?.emit("queueout");
  }
}

export default new MMClass();
