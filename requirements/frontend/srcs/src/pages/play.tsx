import React, { useEffect } from "react";
import socketService from "../services/socketService";
import Modal from "../components/rooms/NewRoomModal";
import Backdrop from "../components/backdrop";
import RoomList from "../components/rooms/RoomList";
import GameContext, { IGameContext } from "../store/game-context";
import gameService from "../services/gameService";
import Game from "../components/game";

export default function PlayPage() {
  const connectSocket = async () => {
    const socket = await socketService
      .connect("http://localhost:5000")
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    connectSocket();
  }, []);

  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadedRooms, setLoadedRooms] = React.useState([] as any);
  const [isInRoom, setIsInRoom] = React.useState(false);
  const gameContextValue: IGameContext = {
    isInRoom: isInRoom,
    setInRoom: setIsInRoom,
    playerSide: 1,
  };

  useEffect(() => {
    fetch("http://localhost:5000/rooms")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const rooms = [];
        for (const key in data) {
          const room = {
            id: key,
            ...data[key],
          };
          rooms.push(room);
        }
        setLoadedRooms(rooms);
        setIsLoading(false);
      });
  }, []);

  const joinRoom = async (roomId: string) => {
    const socket = socketService.socket;
    console.log("here");
    if (!socket) {
      return;
    }
    setIsLoading(true);
    const joined = await gameService
      .joinGameRoom(socket, roomId)
      .catch((err) => {
        console.log("joining room");
        alert(err);
      });
    console.log("joined");
    if (joined) {
      setIsInRoom(true);
    }
    console.log(joined);
    setIsLoading(false);
  };

  function openModalHandler() {
    setModalIsOpen(true);
  }

  function closeModalHandler() {
    setModalIsOpen(false);
  }

  if (isInRoom) {
    return <Game />;
  }

  return (
    <GameContext.Provider value={gameContextValue}>
      <div>Play</div>
      <button className="btn" onClick={openModalHandler}>
        create new room
      </button>
      {modalIsOpen && (
        <Modal onCancel={closeModalHandler} onSubmit={joinRoom} />
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
