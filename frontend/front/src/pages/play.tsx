import { io } from "socket.io-client";
import React, { useEffect, useRef, MutableRefObject, useState, useContext } from 'react';
import { SocketContext } from '../contexts/Socket';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

//location.host = "localhost:4000"

//client 192.168.1.31:4000
//vm en nat

const startmatchmaking = async (e: React.MouseEvent<HTMLButtonElement>, usrSocket: any, obj: {
  idUser: string,
}, navigate: any) => {
  e.preventDefault();
  console.log(obj);
  usrSocket.emit('startmatchmaking', obj, (res: any) => {
      console.log("startmatchmaking : " + res);
  });
}

export default function PlayPage() {

  const [count, setCount] = useState(0);
  const usrSocket = useContext(SocketContext);
  const navigate = useNavigate();

  
  return (
    <div>
            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => startmatchmaking(e,
                usrSocket, {
                idUser: window.navigator.userAgent,
            }, navigate)}
                className='startqueue'>Start Queue</button>
  </div>
    );
  ;
}