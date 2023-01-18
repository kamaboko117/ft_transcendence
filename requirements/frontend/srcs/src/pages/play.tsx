import React, { useEffect } from "react";
import { io } from "socket.io-client";

export default function PlayPage() {
  const connect = () => {
    const socket = io("http://localhost:5000");
  };

  useEffect(() => {
    connect();
  }, []);
  return <div>Play</div>;
}
