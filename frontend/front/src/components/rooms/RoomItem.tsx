import React from "react";

type RoomProps = {
  uid: string;
  roomName: string;
  roomCapacity: number;
  join: any;
};

function RoomItem(props: RoomProps) {
  function joinRoom() {
    props.join(props.uid);
  }

  return (
    <div className="room_item" onClick={joinRoom}>
      <h3 className="room_name">{props.roomName}</h3>
      <h3>capacity: {props.roomCapacity}</h3>
    </div>
  );
}

export default RoomItem;
