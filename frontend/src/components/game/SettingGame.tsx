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
        < Custom_setting cst={custom} usrSocket={props.usrSocket} id={props.id}/>
    </>
    );
}

/**
 * 
 * @param props Chaque div radio = un event => usestate
 *   * chaque click = un event
 * @returns 
 */

// (props: { usrSocket, id: string })

// Value number
// usrSocket emit backend => updateTypeGame



const Custom_size_ball = (props: {usrSocket, id: string}) => {
    const [size, setSize] = useState<string>("2");
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e);
        if (e && e.target) {
            const target: HTMLInputElement = e.target as HTMLInputElement;
            const value: string = target.value;
            console.log(target.value);
            setSize(value)
            if (!isNaN(Number(target.value)) && Number(target.value)) {
                props.usrSocket.emit("updateSizeBall", {size: size, roomId: props.id});
            }
            return (() => {
                props.usrSocket.off("updateTypeGameFromServer");
            });
        }
    }
    useEffect(() => {
          props.usrSocket.on("SizeBallFromServer", (res: {size: number}) => {
            setSize(String(res.size));
          })
    }, []);
    return (
        <div>
            <label><b>Taille de la balle</b></label>
            <input onChange={handleChange} type="radio" value='1' name="size_ball" checked={size === '1'}/>
            <label>Small</label>
            <input onChange={handleChange} type="radio" value='2' name="size_ball" checked={size === '2'}/>
            <label>Normal</label>
            <input onChange={handleChange} type="radio" value='3' name="size_ball" checked={size === '3'}/>
            <label>Big</label>
        </div>
    );
}

const Custom_speed_ball = () => {
    return (
        <div>
            <label><b>Vitesse de la balle</b></label>
            <input type="radio" value='1' id="normalBall" name="speed_ball" checked/>
            <label>Slow</label>
            <input type="radio" value='2' id="averageBall" name="speed_ball" checked/>
            <label>Average</label>
            <input type="radio" value='3' id="fastBall" name="speed_ball" checked/>
            <label>Fast</label>
        </div>
    );
}

const Custom_color_ball = () => {
    return (
        <div>
            <label><b>Couleur de la balle</b></label>
            <input type="radio" value="red" id="redBall" name="color_ball" checked/>
            <label>Red</label>
            <input type="radio" value="blue" id="blueBall" name="color_ball" checked/>
            <label>Blue</label>
            <input type="radio" value="green" id="greenBall" name="color_ball" checked/>
            <label>Green</label>
        </div>
    );
}

const Custom_power_up = () => {
    return (
        <div>
            <label><b>Power Up</b></label>
            <input type="checkbox" name="Power_Up" value="powerUp" />
        </div>
    );
}

const Custom_setting = (props: {cst: boolean, usrSocket, id: string }) => {
    if (props.cst === true) {
        return (
            <>
                <br />
                <label>Custom game</label>
                <br />
                <br />
                <Custom_size_ball usrSocket={props.usrSocket} id={props.id}/>
                <br />
                <br />
                
                <br />
                <br />
               
                <br />
                
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