import React, { useEffect, useState } from "react";
import gameService from "../../services/gameService";

interface IGameSettings {
  powerUps: boolean;
  type: string;
  goal: number;
  speed: number;
  acceleration: number;
  ballSize: number;
  ballColor: string;
}

const globalSettings: IGameSettings = {
  powerUps: false,
  type: "classic",
  goal: 11,
  speed: 5,
  acceleration: 0.1,
  ballSize: 10,
  ballColor: "WHITE",
};

const resetGlobalSettings = () => {
  globalSettings.powerUps = false;
  globalSettings.type = "classic";
  globalSettings.goal = 11;
  globalSettings.speed = 5;
  globalSettings.acceleration = 0.1;
  globalSettings.ballSize = 10;
  globalSettings.ballColor = "WHITE";
};

const changeGlobalSettings = (settings: IGameSettings) => {
  globalSettings.powerUps = settings.powerUps;
  globalSettings.type = settings.type;
  globalSettings.goal = settings.goal;
  globalSettings.speed = settings.speed;
  globalSettings.acceleration = settings.acceleration;
  globalSettings.ballSize = settings.ballSize;
  globalSettings.ballColor = settings.ballColor;
};

const ButtonIsCustom = (props: { usrSocket; id: string }) => {
  const [custom, setCustom] = useState<boolean>(false);
  //const [customForm, setCustomForm] = useState<custom_form>();
  const handleRdy = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e && e.target) setCustom((prev) => !prev);
  };

  useEffect(() => {
    props.usrSocket.on("updateTypeGameFromServer", (res: { type: boolean }) => {
      setCustom(res.type);
    });
    return () => {
      props.usrSocket.off("updateTypeGameFromServer");
    };
  }, []);
  useEffect(() => {
    props.usrSocket.emit(
      "updateTypeGame",
      { type: custom, roomId: props.id },
      (res: { type: boolean }) => {
        setCustom(res.type);
      }
    );
  }, [custom]);
  return (
    <>
      <button onClick={handleRdy}>
        {custom === false
          ? "Click to transform into custom game"
          : "Click to disable custom game"}
      </button>
      <Custom_setting cst={custom} usrSocket={props.usrSocket} id={props.id} />
    </>
  );
};

const Custom_size_ball = (props: { usrSocket }) => {
  const [size, setSize] = useState<string>("10");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target) {
      setSize(e.target.value);
      globalSettings.ballSize = Number(e.target.value);
      if (!isNaN(Number(e.target.value)) && Number(e.target.value)) {
        props.usrSocket.emit("edit_settings", { ...globalSettings });
      }
    }
  };
  useEffect(() => {
    props.usrSocket.on("edit_settings", (res: IGameSettings) => {
      changeGlobalSettings(res);
      setSize(res.ballSize.toString());
    });
  }, []);
  return (
    <div>
      <label>
        <b>Taille de la balle</b>
      </label>
      <input
        onChange={handleChange}
        type="radio"
        value={5}
        name="size_ball"
        checked={size === "5"}
      />
      <label>Small</label>
      <input
        onChange={handleChange}
        type="radio"
        value={10}
        name="size_ball"
        checked={size === "10"}
      />
      <label>Normal</label>
      <input
        onChange={handleChange}
        type="radio"
        value={20}
        name="size_ball"
        checked={size === "20"}
      />
      <label>Big</label>
    </div>
  );
};

const Custom_speed_ball = (props: { usrSocket }) => {
  const [speed, setSpeed] = useState<string>("5");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target) {
      setSpeed(e.target.value);
      globalSettings.speed = Number(e.target.value);
      if (!isNaN(Number(e.target.value)) && Number(e.target.value)) {
        props.usrSocket.emit("edit_settings", { ...globalSettings });
      }
    }
  };
  useEffect(() => {
    props.usrSocket.on("edit_settings", (res: IGameSettings) => {
      changeGlobalSettings(res);
      setSpeed(res.speed.toString());
    });
  }, []);
  return (
    <div>
      <label>
        <b>Vitesse de la balle</b>
      </label>
      <input
        onChange={handleChange}
        type="radio"
        value={3}
        id="normalBall"
        name="speed_ball"
        checked={speed === "3"}
      />
      <label>Slow</label>
      <input
        onChange={handleChange}
        type="radio"
        value={5}
        id="averageBall"
        name="speed_ball"
        checked={speed === "5"}
      />
      <label>Average</label>
      <input
        onChange={handleChange}
        type="radio"
        value={10}
        id="fastBall"
        name="speed_ball"
        checked={speed === "10"}
      />
      <label>Fast</label>
    </div>
  );
};

const Custom_color_ball = () => {
  return (
    <div>
      <label>
        <b>Couleur de la balle</b>
      </label>
      <input type="radio" value="red" id="redBall" name="color_ball" checked />
      <label>Red</label>
      <input
        type="radio"
        value="blue"
        id="blueBall"
        name="color_ball"
        checked
      />
      <label>Blue</label>
      <input
        type="radio"
        value="green"
        id="greenBall"
        name="color_ball"
        checked
      />
      <label>Green</label>
    </div>
  );
};

const Custom_power_up = (props: { usrSocket }) => {
    const [isCheck, setIsCheck] = useState<boolean>(false);
    const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e && e.target) {
            setIsCheck((isCheck) => !isCheck);
            globalSettings.powerUps = !isCheck;
            props.usrSocket.emit("edit_settings", { ...globalSettings });
        }
    }
    useEffect(() => {
      props.usrSocket.on("edit_settings", (res: IGameSettings) => {
        changeGlobalSettings(res);
        setIsCheck(res.powerUps);
      });
      return () => {
        props.usrSocket.off("edit_settings");
      };
    }, []);
  return (
    <div>
      <label>
        <b>Power Up</b>
      </label>
      <input onChange={handleCheck} type="checkbox" name="Power_Up" value="powerUp" checked={isCheck}/>
    </div>
  );
};

const Custom_setting = (props: { cst: boolean; usrSocket; id: string }) => {
  useEffect(() => {
    props.usrSocket.on("edit_settings", (res: IGameSettings) => {
      changeGlobalSettings(res);
    });
    return () => {
      props.usrSocket.off("edit_settings");
    };

  }, []);
  if (props.cst === true) {
    globalSettings.type = "Custom";
    props.usrSocket.emit("edit_settings", { ...globalSettings });
    return (
      <>
        <br />
        <label>Custom game</label>
        <br />
        <br />
        <Custom_size_ball usrSocket={props.usrSocket} />
        <br />
        <br />
        <Custom_speed_ball usrSocket={props.usrSocket} />
        <br />
        <br />
        < Custom_power_up usrSocket={props.usrSocket}/>
        <br />
      </>
    );
  } else {
    resetGlobalSettings();
    props.usrSocket.emit("edit_settings", { ...globalSettings });
    return <></>;
  }
};

const ButtonRdy = () => {
  const [rdy, setRdy] = useState<boolean>(false);

  const handleRdy = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e && e.target) setRdy((prev) => !prev);
  };
  return (
    <button onClick={handleRdy}>
      {rdy === false ? "Click to be ready" : "Stop ready"}
    </button>
  );
};

const ListUser = (props: { usr1: string; usr2: string }) => {
  return (
    <div>
      <label>User 1: {props.usr1}</label>
      <br />
      <label>User 2: {props.usr2}</label>
    </div>
  );
};

const SettingGame = (props: { socketService: { socket: any }; id: string }) => {
  const [errorCode, setErrorCode] = useState<number>(200);
  const [usr1, setUsr1] = useState<string>("");
  const [usr2, setUsr2] = useState<string>("");

  useEffect(() => {
    console.log(props.id);
    console.log(props.socketService.socket);
    if (props.socketService.socket) {
      console.log("socketed");
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
      };
      game();
      console.log("joined from game component");
    }
    console.log("Game room mounting");
    return () => {
      console.log("Game room unmount");
      props.socketService.socket?.emit("leave_game", { roomId: props.id });
      props.socketService.socket?.off("join_game_success");
      props.socketService.socket?.off("join_game_error");
    };
  }, [props.socketService.socket]);

  useEffect(() => {
    props.socketService.socket.on(
      "user_leave_room",
      (res: { username: string }) => {
        console.log(res);
        if (res.username === usr1) {
          setUsr1("");
        }
        if (res.username === usr2) {
          setUsr2("");
        }
      }
    );
    return () => {
      props.socketService.socket?.off("user_leave_room");
    };
  }, [usr1, usr2]);

  return (
    <div className="createParty">
      <h1 className="room_name">Game</h1>
      {errorCode != 1 ? (
        <h1>waiting for opponent</h1>
      ) : (
        <h1>Room is full, you are spectator</h1>
      )}
      <ListUser usr1={usr1} usr2={usr2} />
      <ButtonIsCustom usrSocket={props.socketService.socket} id={props.id} />
      <br />
      <ButtonRdy />
    </div>
  );
};

export default SettingGame;

/*
 * Power up
 * Type
 * Goal
 * Speed
 * Acceleration
 * Color
 */