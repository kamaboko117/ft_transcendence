//import { SocketContext } from '../../contexts/Socket';
import React, { useEffect, useRef, MutableRefObject, useState, useContext } from 'react';
import { io, Socket } from 'socket.io-client';
/*
export class MMClass extends React.Component {
  private MMSocket?: any;
  private readonly MMnamespace = "matchmaking";
  //JWT token stuffs? local storage?
  static contextType = SocketContext;
  constructor(props) {
    super(props)
    const url = `${import.meta.env.VITE_APP_URI}/${this.MMnamespace}`;
    //this.MMSocket = io(url);
    this.MMSocket = this.context;
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

export default new MMClass(props);
*/

export const findMatch = (usrSocket) => {
  console.log("start queue in");
  usrSocket.emit("queuein",  (res) => {
    console.log("res: ");
    console.log(res);
  });
}

export const declineMatch = (usrSocket) => {
  usrSocket.emit("declineMMmatch");
}

export const acceptMatch = (usrSocket) => {
  usrSocket.emit("acceptMMmatch");
}

export const stopFindingMatch = (usrSocket) => {
  usrSocket.emit("queueout");
}

//export default MMSocket;