import React, { useEffect } from "react";
import socketService from "../services/socketService";
import Modal from "../components/rooms/NewRoomModal";
import Backdrop from "../components/backdrop";

export default function PlayPage() {
  // const connectSocket = async () => {
  //   const socket = await socketService
  //     .connect("http://localhost:5000")
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  // useEffect(() => {
  //   connectSocket();
  // }, []);

  const [modalIsOpen, setModalIsOpen] = React.useState(false);
  function openModalHandler() {
    setModalIsOpen(true);
  }

  function closeModalHandler() {
    setModalIsOpen(false);
  }

  return (
    <div>
      <div>Play</div>
      <button className="btn" onClick={openModalHandler}>create new room</button>
      {modalIsOpen && <Modal/>}
      {modalIsOpen && <Backdrop onClick={closeModalHandler}/>}
    </div>
  );
}
