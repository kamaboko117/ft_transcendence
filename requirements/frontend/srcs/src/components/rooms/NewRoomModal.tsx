import { useRef } from "react";

function NewRoomModal(props: any) {
    const roomNameInputRef = useRef<HTMLInputElement>(null);

    async function AddRoomHandler(roomname: string) {
        let room;
        await fetch("http://localhost:5000/rooms/create", {
            method: "POST",
            body: JSON.stringify({
                roomName: roomname,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                room = data.uid;
            });
        return room;
    }

    async function submitHandler(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const roomName = roomNameInputRef.current!.value;
        
        const room = await AddRoomHandler(roomName);
        props.onSubmit(room);
        props.onCancel();
       
    }

    function cancelHandler() {
        props.onCancel();
    }

    return (
        <div className='modal'>
            <form onSubmit={submitHandler}>
                <p>Create new room</p>
                <input
                    type="text"
                    placeholder="room name"
                    ref={roomNameInputRef}
                />
                <button className="btn" type="submit">Create</button>
                <button className="btn btn--alt" onClick={cancelHandler}>Cancel</button>
            </form>
        </div>
    );
}

export default NewRoomModal;