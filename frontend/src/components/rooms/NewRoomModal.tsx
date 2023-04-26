import React, { useRef, useState } from "react";
import { FetchError, header, headerPost } from '../FetchError';

function NewRoomModal(props: any) {
    const roomNameInputRef = useRef<HTMLInputElement>(null);
    const [errorCode, setErrorCode] = useState<number>(200);

    async function createRoomHandler(roomname: string) {
        let room: string = "";
        await fetch("https://" + location.host + "/api/rooms/create", {
            method: "POST",
            body: JSON.stringify({
                roomName: roomname,
            }),
            headers: headerPost(props.jwt)
        })
            .then((response) => {
                if (response.ok)
                    return response.json();
                setErrorCode(response.status);
            })
            .then((data) => {
                console.log(data);
                if (data && data.err){
                    setErrorCode(1);
                    return ("");
                }
                if (data){
                    room = data.uid;
                }
                    
            }).catch(err => console.log(err));
        return room;
    }

    async function submitHandler(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!roomNameInputRef.current) {
            return ;
        }
        const roomName = roomNameInputRef.current.value;
        const room = await createRoomHandler(roomName);

        props.onSubmit(room);
        if (room && room != "")
            props.onCancel();
    }

    function cancelHandler() {
        props.onCancel();
    }

    return (
        <>
            {errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
            <div className='modal'>
                <form onSubmit={submitHandler}>
                    <p style={{"color": "black"}}>Create new room</p>
                    <input
                        type="text"
                        placeholder="room name"
                        ref={roomNameInputRef}
                    />
                    <button className="btn" type="submit">Create</button>
                    <button className="btn btn-second" onClick={cancelHandler}>Cancel</button>
                </form>
                {errorCode === 1 && <p style={{"color": "red"}}>room name length too big, too little, or use alpha-numeric name format</p>}
            </div>
        </>
    );
}

export default NewRoomModal;