import { useRef } from "react";

function NewRoomModal(props: any) {
    const roomNameInputRef = useRef<HTMLInputElement>(null);

    function submitHandler(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const roomName = roomNameInputRef.current!.value;
        props.onAddUser(roomName);
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
                <button className="btn">Create</button>
                <button className="btn btn--alt">Cancel</button>
            </form>
        </div>
    );
}

export default NewRoomModal;