import React, { useEffect } from "react";
import { io } from "socket.io-client";
//location.host = "localhost:4000"

//client 192.168.1.31:4000
//vm en nat
export default function PlayPage() {
  const connect = () => {
    const socket = io("http://localhost:4000");
  };

  useEffect(() => {
    connect();
  }, []);
  return <div>Play</div>;
}