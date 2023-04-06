import React, { useRef, useState } from "react";
import { FetchError, header, headerPost } from '../FetchError';

function NewRoomModal(props: any) {
    const roomNameInputRef = useRef<HTMLInputElement>(null);
    const [errorCode, setErrorCode] = useState<number>(200);

    async function AddRoomHandler(roomname: string) {
        let room;
        await fetch("http://" + location.host + "/api/rooms/create", {
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
                if (data)
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
        <>
            {errorCode && errorCode >= 400 && <FetchError code={errorCode} />}
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
        </>
    );
}

export default NewRoomModal;