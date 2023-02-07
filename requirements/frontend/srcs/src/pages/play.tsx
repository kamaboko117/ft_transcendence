import React, { useEffect } from "react";
import socketService from "../services/socketService";

export default function PlayPage() {
  const connectSocket = async () => {
    const socket = await socketService.connect("http://localhost:5000").catch((err) => {
      console.log(err);
    });
  };

  useEffect(() => {
    connectSocket();
  }, []);

  return <div>Play</div>;
}
