import React from "react";
import RoomItem from "./RoomItem";

interface IRoomProps {
  rooms: any;
}

export function RoomList(props: IRoomProps) {
  return (
    <div>
      Room List
      <ul>
        {props.rooms.map((item: any) => (
          <RoomItem
            key={item.id}
            roomID={item.roomID}
            roomName={item.roomName}
            roomCapacity={item.roomCapacity}
          />
        ))}
      </ul>
    </div>
  );
}
