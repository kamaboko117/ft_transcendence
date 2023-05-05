import React, { useEffect, useContext, useState } from "react";
//import socketService from "../services/socketService";
import Modal from "../components/rooms/NewRoomModal";
import Backdrop from "../components/backdrop";
import RoomList from "../components/rooms/RoomList";
import GameContext, { IGameContext } from "../contexts/game-context";
import Game from "../components/game";
import SocketContext from "../contexts/Socket";
import { FetchError, header } from "../components/FetchError";

export default function PlayPage(props: { jwt: string | null }) {
  /*const connectSocket = async () => {
    const socket = await socketService
      .connect("http://localhost:5000")
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    connectSocket();
  }, []);
*/
  const [idRoom, setIdRoom] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedRooms, setLoadedRooms] = useState([] as any);
  const [isInRoom, setIsInRoom] = useState(false);
  const gameContextValue: IGameContext = {
    idRoom: idRoom,
    roomName: roomName,
    isInRoom: isInRoom,
    setInRoom: setIsInRoom,
    playerSide: 1,
  };
  const [errorCode, setErrorCode] = useState<number>(200);
  const { usrSocket } = useContext(SocketContext);

  useEffect(() => {
    fetch("https://" + location.host + "/api/rooms", {
      headers: header(props.jwt),
    })
      .then((response) => {
        if (response && response.ok) return response.json();
        setErrorCode(response.status);
      })
      .then((data) => {
        const rooms: any = [];
        for (const key in data) {
          const room = {
            id: key,
            ...data[key],
          };
          rooms.push(room);
        }
        setLoadedRooms(rooms);
        setIsLoading(false);
        console.log("is in " + isInRoom);
      })
      .catch((err) => console.log(err));
    return () => {
      console.log("play unmount");
      setLoadedRooms([]);
      //usrSocket?.off("join_game_success");
      //usrSocket?.off("join_game_error");
      console.log("is in unmount " + isInRoom);
    };
  }, []);

  const joinRoom = async (roomId: string) => {
    //socketService.socket = usrSocket
    //const socket = socketService.socket;

    console.log("here");
    if (!usrSocket) {
      return;
    }
    setIsLoading(true);
    //const joined = await gameService
    //  .joinGameRoom(usrSocket, roomId)
    //  .catch((err) => {
    //    console.log("joining room");
    //    alert(err);
    //  });
    console.log("joined");
    if (roomId && roomId != "") {
      let roomName = "";
      await fetch(`https://${location.host}/api/rooms/${roomId}`, {
        headers: header(props.jwt),
      })
        .then((response) => {
          if (response && response.ok) return response.json();
          setErrorCode(response.status);
        })
        .then((data) => {
          if (data)
            roomName = data.roomName;
          console.log(roomName);
        });
      setRoomName(roomName);
      setIdRoom(roomId);
      setIsInRoom(true);
    }
    //console.log(joined);
    setIsLoading(false);
  };

  function openModalHandler() {
    setModalIsOpen(true);
  }

  function closeModalHandler() {
    setModalIsOpen(false);
  }

  if (isInRoom) {
    return <Game id={idRoom} usrSocket={usrSocket} roomName={roomName} jwt={props.jwt} />;
  }

  return (
    <GameContext.Provider value={gameContextValue}>
      {errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
      <button className="btn" onClick={openModalHandler}>
        Create New Room
      </button>
      {modalIsOpen && (
        <Modal
          jwt={props.jwt}
          onCancel={closeModalHandler}
          onSubmit={joinRoom}
        />
      )}
      {modalIsOpen && <Backdrop onClick={closeModalHandler} />}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <RoomList rooms={loadedRooms} join={joinRoom} />
      )}
    </GameContext.Provider>
  );
}
