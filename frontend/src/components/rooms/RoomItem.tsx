import React from "react";

type RoomProps = {
  uid: string;
  roomName: string;
  join: any;
};

function RoomItem(props: RoomProps) {
  function joinRoom() {
    props.join(props.uid);
  }

  return (
    <div className="room_item" onClick={joinRoom}>
      <h3 className="room_name">{props.roomName}</h3>
    </div>
  );
}

export default RoomItem;
