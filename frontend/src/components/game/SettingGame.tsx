import React, { useEffect, useState } from 'react';
import gameService from "../../services/gameService";

type custom_form = {
    ballSize: number,
    ballSpeed: number,
    ballColor: string,
    powerUp: boolean,
}

const ButtonIsCustom = (props: { usrSocket, id: string }) => {
    const [custom, setCustom] = useState<boolean>(false);
    const [customForm, setCustomForm] = useState<custom_form>();
    const handleRdy = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (e && e.target)
            setCustom(prev => !prev);
    }

    useEffect(() => {
        props.usrSocket.on("updateTypeGameFromServer", (res: { type: boolean }) => {
            setCustom(res.type);
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
    return (<>
        <button onClick={handleRdy}>{
            (custom === false ? "Click to transform into custom game" : "Click to disable custom game")
        }</button>
        < Custom_setting cst={custom} />
    </>
    );
}

const Custom_setting = (props: {cst: boolean}) => {
    if (props.cst === true) {
        return (
            <>
                <br />
                <label>Custom game</label>
                <br />
                <br />
                <div>
                    <label><b>Taille de la balle</b></label>
                    <input type="radio" value='0.5' id="smallBall" name="ball" checked/>
                    <label>Small</label>
                    <input type="radio" value='1' id="mediumBall" name="ball" />
                    <label>Normal</label>
                    <input type="radio" value='4' id="bigBall" name="ball" />
                    <label>Big</label>
                </div>
                <br />
                <br />
                <div>
                    <label><b>Vitesse de la balle</b></label>
                    <input type="radio" value='0.5' id="slowBall" name="speed" checked/>
                    <label>Slow</label>
                    <input type="radio" value='1' id="averageBall" name="speed" checked/>
                    <label>Average</label>
                    <input type="radio" value='4' id="fastBall" name="speed" checked/>
                    <label>Fast</label>
                </div>
                <br />
                <br />
                <div>
                    <label><b>Couleur de la balle</b></label>
                    <input type="radio" value="red" id="redBall" name="color" checked/>
                    <label>Red</label>
                    <input type="radio" value="blue" id="blueBall" name="color" checked/>
                    <label>Blue</label>
                    <input type="radio" value="green" id="greenBall" name="color" checked/>
                    <label>Green</label>
                </div>
                <br />
                <div>
                    <label><b>Power up</b></label>
                    <input type="checkbox" name="Power_Up" value="powerUp"/>
                </div>
            </>
        );
    } else {
        return (<></>);
    }
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
        console.log(props.id)
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
    }, [usr1, usr2])

    return (
        <div className="createParty">
            <h1 className="room_name">Game</h1>
            {(errorCode != 1 ? <h1>waiting for opponent</h1> : <h1>Room is full, you are spectator</h1>)}
            <ListUser usr1={usr1} usr2={usr2} />
            <ButtonIsCustom usrSocket={props.socketService.socket} id={props.id} />
            <br />
            <ButtonRdy />
        </div>
    );
}

export default SettingGame