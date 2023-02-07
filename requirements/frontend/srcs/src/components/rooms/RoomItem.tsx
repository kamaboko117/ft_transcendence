type RoomProps = {
    roomID: number,
    roomName: string,
    roomCapacity: number,
}

function RoomItem(props: RoomProps) {
    return <li>
        <div>
            <h3>{props.roomID}</h3>
            <h3>{props.roomName}</h3>
            <h3>{props.roomCapacity}</h3>
        </div>
    </li>
}

export default RoomItem;