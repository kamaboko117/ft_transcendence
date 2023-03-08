import React from "react";
import RoomItem from "./RoomItem";

interface IRoomProps {
  rooms: any;
  join: any;
}

export default function RoomList(props: IRoomProps) {
  return (
    <div>
      Room List
      <ul className="room_list">
        {props.rooms.map((item: any) => (
          <RoomItem
            key={item.id}
            uid={item.uid}
            roomName={item.roomName}
            roomCapacity={item.Capacity}
            join={props.join}
          />
        ))}
      </ul>
    </div>
  );
}
