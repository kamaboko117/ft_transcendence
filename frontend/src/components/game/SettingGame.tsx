import React, { useEffect, useState } from 'react';
import gameService from "../../services/gameService";

const ButtonIsCustom = () => {
    const [custom, setCustom] = useState<boolean>(false);

    const handleRdy = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e && e.target)
            setCustom(prev => !prev);
    }
    return (<button onClick={handleRdy}>{(custom === false ? "Click to transform into custom game" : "Click to disable custom game")}</button>);
}

const ButtonRdy = () => {
    const [rdy, setRdy] = useState<boolean>(false);

    const handleRdy = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e && e.target)
            setRdy(prev => !prev);
    }
    return (<button onClick={handleRdy}>{(rdy === false ? "Click to be ready" : "Stop ready")}</button>);
}

const ListUser = (props: { usr1: string, usr2: string }) => {
    return (<div>
        <label>User 1: {props.usr1}</label>
        <br /><label>User 2: {props.usr2}</label>
    </div>);
}

const SettingGame = (props: { socketService: { socket: any }, id: string }) => {
    const [errorCode, setErrorCode] = useState<number>(200);
    const [usr1, setUsr1] = useState<string>("");
    const [usr2, setUsr2] = useState<string>("");
    useEffect(() => {
        console.log(props.socketService.socket)
        if (props.socketService.socket) {
            console.log("socketed")
            const game = async () => {
                await gameService
                    .joinGameRoom(props.socketService.socket, props.id, setUsr1, setUsr2)
                    .then((res) => {
                        console.log(res);
                    })
                    .catch((err) => {
                        console.log("joining room " + err);
                        setErrorCode(1);
                    });
            }
            game();
            console.log("joined from game component");
        }
        console.log("Game room mounting");
        return (() => {
            console.log("Game room unmount");
            props.socketService.socket?.emit("leave_game", { roomId: props.id });
            props.socketService.socket?.off("join_game_success");
            props.socketService.socket?.off("join_game_error");
        });
    }, [props.socketService.socket]);

    return (
        <div className="createParty">
            <h1 className="room_name">Game</h1>
            {(errorCode != 1 ? <h1>waiting for opponent</h1> : <h1>Room is full, you are spectator</h1>)}
            <ListUser usr1={usr1} usr2={usr2} />
            <ButtonIsCustom />
            <br />
            <ButtonRdy />
        </div>
    );
}

export default SettingGame