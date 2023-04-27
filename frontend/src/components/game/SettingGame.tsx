import React, { useEffect, useState } from 'react';
import gameService from "../../services/gameService";
import { FetchError } from '../FetchError';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

const ButtonIsCustom = (props: {
    usrSocket, id: string,
    setTypeGame: React.Dispatch<React.SetStateAction<string>>
}) => {
    const [custom, setCustom] = useState<boolean>(false);
    const handleRdy = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e && e.target)
            setCustom(prev => !prev);
    }

    useEffect(() => {
        props.usrSocket.on("updateTypeGameFromServer", (res: { type: boolean }) => {
            setCustom(res.type);
            props.setTypeGame("Custom");
        });
        return (() => {
            props.usrSocket.off("updateTypeGameFromServer");
        });
    }, []);
    useEffect(() => {
        props.usrSocket.emit("updateTypeGame", { type: custom, roomId: props.id }, ((res: { type: boolean }) => {
            setCustom(res.type);
        }));
    }, [custom]);
    return (<button onClick={handleRdy}>{
        (custom === false ? "Click to transform into custom game" : "Click to disable custom game")
    }</button>);
}

const ButtonRdy = (props: { usrSocket, uid: string, usr1: string, usr2: string }) => {
    const [rdy, setRdy] = useState<boolean>(false);

    const handleRdy = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e && e.target) {
            setRdy(prev => !prev);
        }
    }

    useEffect(() => {
        props.usrSocket.on("updateUserRdy", () => {
            setRdy(false);
        });
        return (() => {
            props.usrSocket.off("updateUserRdy");
        });
    });

    useEffect(() => {
        props.usrSocket.emit("userIsRdy", {
            uid: props.uid,
            usr1: props.usr1,
            usr2: props.usr2,
            rdy: rdy
        });
    }, [rdy]);
    return (<button onClick={handleRdy}>{(rdy === false ? "Click to be ready" : "Stop ready")}</button>);
}

const ListUser = (props: { usr1: string, usr2: string }) => {
    return (<div>
        <label>User 1: {props.usr1}</label>
        <br /><label>User 2: {props.usr2}</label>
    </div>);
}

const SettingGame = (props: {
    socketService: { socket: any },
    id: string,
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    isGameStarted: boolean, typeGame: string, setTypeGame: React.Dispatch<React.SetStateAction<string>>
}) => {
    const [errorCode, setErrorCode] = useState<number>(200);
    const [usr1, setUsr1] = useState<string>("");
    const [usr2, setUsr2] = useState<string>("");
    const [errorText, setErrorText] = useState<string>("");
    useEffect(() => {
        console.log(props.id);
        console.log(props.socketService.socket);
        if (props.socketService.socket) {
            console.log("socketed")
            const game = async () => {
                await gameService
                    .joinGameRoom(props.socketService.socket, props.id, setUsr1, setUsr2)
                    .then((res) => {
                        console.log(res);
                    })
                    .catch((err: string) => {
                        setErrorText(err)
                        console.log("joining room " + err);
                        setErrorCode(1);
                        props.socketService.socket?.off("join_game_success");
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

    useEffect(() => {
        props.socketService.socket.on("user_leave_room", (res: { username: string }) => {
            console.log(res)
            if (res.username === usr1) {
                setUsr1("");
            }
            if (res.username === usr2) {
                setUsr2("");
            }
        });
        return (() => {
            props.socketService.socket?.off("user_leave_room");
        });
    }, [usr1, usr2]);

    if (!props.isGameStarted) {
        return (
            <>
                {errorCode >= 400 && <FetchError code={errorCode} />}
                <div className="createParty">
                    <h1 className="room_name">Game</h1>
                    {(errorCode != 1 ? <h1>waiting for opponent</h1> : <h1>Error : {errorText}</h1>)}
                    {errorCode != 1 && <><ListUser usr1={usr1} usr2={usr2} />
                        <ButtonIsCustom usrSocket={props.socketService.socket}
                            id={props.id} setTypeGame={props.setTypeGame} />
                        <br />
                        <ButtonRdy usrSocket={props.socketService.socket}
                            uid={props.id} usr1={usr1} usr2={usr2} /></>}

                </div>
            </>
        );
    } else {
        return (
            <>
                {errorCode >= 400 && <FetchError code={errorCode} />}
                <div className="game">
                    <h1 className="room_name">Game</h1>
                    <canvas
                        ref={props.canvasRef}
                        className="game_canvas"
                        id="pong"
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                    ></canvas>
                </div>
            </>
        );
    }
}

export default SettingGame