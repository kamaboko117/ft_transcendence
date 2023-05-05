import React, { useEffect, useState } from "react";
import gameService from "../../services/gameService";
import { FetchError } from "../FetchError";
import ActivePowerUpsList from "./ActivePowerUpsList";
import { useParams } from "react-router-dom";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

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

const ButtonIsCustom = (props: {
  usrSocket : any;
  id: string;
  setRdy: React.Dispatch<React.SetStateAction<boolean>>;
  custom: boolean;
  setCustom: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  // const [custom, setCustom] = useState<boolean>(false);
  const handleRdy = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e && e.target) props.setCustom((prev) => !prev);
  };
  useEffect(() => {
    props.usrSocket.on("updateTypeGameFromServer", (res: { type: boolean }) => {
      props.setRdy(false);
      if (res) props.setCustom(res.type);
      console.log(res.type);
    });
    return () => {
      props.usrSocket.off("updateTypeGameFromServer");
    };
  }, []);
  useEffect(() => {
    props.usrSocket.emit(
      "updateTypeGame",
      { type: props.custom, roomId: props.id },
      (res: { type: boolean }) => {
        console.log(res.type);
        props.setRdy(false);
        if (res) props.setCustom(res.type);
      }
    );
  }, [props.custom]);

  return (
    <>
      <button onClick={handleRdy}>
        {props.custom === false
          ? "Click to transform into custom game"
          : "Click to disable custom game"}
      </button>
      <Custom_setting
        cst={props.custom}
        usrSocket={props.usrSocket}
        id={props.id}
      />
    </>
  );
};

const ButtonRdy = (props: {
  usrSocket : any;
  uid: string;
  usr1: string;
  usr2: string;
  rdy: boolean;
  setRdy: React.Dispatch<React.SetStateAction<boolean>>;
  custom: boolean;
  setCustom: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  //const [rdy, setRdy] = useState<boolean>(false);
  const handleRdy = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e && e.target) {
      props.setRdy((prev) => !prev);
    }
  };

  useEffect(() => {
    props.usrSocket.on("updateUserRdy", () => {
      props.setRdy(false);
      props.setCustom(false);
    });
    return () => {
      props.usrSocket.off("updateUserRdy");
    };
  });

  useEffect(() => {
    props.usrSocket.emit("userIsRdy", {
      uid: props.uid,
      usr1: props.usr1,
      usr2: props.usr2,
      rdy: props.rdy,
      custom: props.custom,
    });
  }, [props.rdy]);
  return (
    <button onClick={handleRdy}>
      {props.rdy === false ? "Click to be ready" : "Stop ready"}
    </button>
  );
};

const Custom_size_ball = (props: { usrSocket : any }) => {
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

const Custom_speed_ball = (props: { usrSocket : any }) => {
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
        name="speed_ball"
        checked={speed === "3"}
      />
      <label>Slow</label>
      <input
        onChange={handleChange}
        type="radio"
        value={5}
        name="speed_ball"
        checked={speed === "5"}
      />
      <label>Average</label>
      <input
        onChange={handleChange}
        type="radio"
        value={10}
        name="speed_ball"
        checked={speed === "10"}
      />
      <label>Fast</label>
    </div>
  );
};

const Custom_acceleration_ball = (props: { usrSocket : any }) => {
  const [acc, setAcc] = useState<string>("0.1");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target) {
      setAcc(e.target.value);
      globalSettings.acceleration = Number(e.target.value);
      if (!isNaN(Number(e.target.value)) && Number(e.target.value)) {
        props.usrSocket.emit("edit_settings", { ...globalSettings });
      }
    }
  };
  useEffect(() => {
    props.usrSocket.on("edit_settings", (res: IGameSettings) => {
      changeGlobalSettings(res);
      setAcc(res.acceleration.toString());
    });
  }, []);
  return (
    <div>
      <label>
        <b>Acceleration de la balle</b>
      </label>
      <input
        onChange={handleChange}
        type="radio"
        value={0.1}
        name="acc_ball"
        checked={acc === "0.1"}
      />
      <label>Normal</label>
      <input
        onChange={handleChange}
        type="radio"
        value={0.2}
        name="acc_ball"
        checked={acc === "0.2"}
      />
      <label>Speed</label>
      <input
        onChange={handleChange}
        type="radio"
        value={0.4}
        name="acc_ball"
        checked={acc === "0.4"}
      />
      <label>Sonic</label>
    </div>
  );
};

const Custom_goal = (props: { usrSocket : any}) => {
  const [goal, setGoal] = useState<string>("11");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target) {
      setGoal(e.target.value);
      globalSettings.goal = Number(e.target.value);
      if (!isNaN(Number(e.target.value)) && Number(e.target.value)) {
        props.usrSocket.emit("edit_settings", { ...globalSettings });
      }
    }
  };
  useEffect(() => {
    props.usrSocket.on("edit_settings", (res: IGameSettings) => {
      changeGlobalSettings(res);
      setGoal(res.goal.toString());
    });
  }, []);
  return (
    <div>
      <label>
        <b>Match Point</b>
      </label>
      <input
        onChange={handleChange}
        type="radio"
        value={11}
        name="goal_ball"
        checked={goal === "11"}
      />
      <label>Normal</label>
      <input
        onChange={handleChange}
        type="radio"
        value={12}
        name="goal_ball"
        checked={goal === "12"}
      />
      <label>Long</label>
      <input
        onChange={handleChange}
        type="radio"
        value={42}
        name="goal_ball"
        checked={goal === "42"}
      />
      <label>Transendance long</label>
    </div>
  );
};

const Custom_color_ball = (props: { usrSocket : any}) => {
  const [color, setColor] = useState<string>("WHITE");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target) {
      setColor(e.target.value);
      globalSettings.ballColor = e.target.value;
      props.usrSocket.emit("edit_settings", { ...globalSettings });
    }
  };
  useEffect(() => {
    props.usrSocket.on("edit_settings", (res: IGameSettings) => {
      changeGlobalSettings(res);
      setColor(res.ballColor);
    });
  }, []);
  return (
    <div>
      <label>
        <b>Color Ball</b>
      </label>
      <input
        onChange={handleChange}
        type="radio"
        value={"WHITE"}
        name="color_ball"
        checked={color === "WHITE"}
      />
      <label>WHITE</label>
      <input
        onChange={handleChange}
        type="radio"
        value={"RED"}
        name="color_ball"
        checked={color === "RED"}
      />
      <label>RED</label>
      <input
        onChange={handleChange}
        type="radio"
        value={"GREEN"}
        name="color_ball"
        checked={color === "GREEN"}
      />
      <label>GREEN</label>
      <input
        onChange={handleChange}
        type="radio"
        value={"BLUE"}
        name="color_ball"
        checked={color === "BLUE"}
      />
      <label>BLUE</label>
    </div>
  );
};

const Custom_power_up = (props: { usrSocket : any}) => {
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target) {
      setIsCheck((isCheck) => !isCheck);
      globalSettings.powerUps = !isCheck;
      props.usrSocket.emit("edit_settings", { ...globalSettings });
    }
  };
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
      <input
        onChange={handleCheck}
        type="checkbox"
        name="Power_Up"
        value="powerUp"
        checked={isCheck}
      />
    </div>
  );
};

const Custom_setting = (props: { cst: boolean; usrSocket : any; id: string }) => {
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
        <Custom_acceleration_ball usrSocket={props.usrSocket} />
        <br />
        <br />
        <Custom_goal usrSocket={props.usrSocket} />
        <br />
        <br />
        <Custom_color_ball usrSocket={props.usrSocket} />
        <br />
        <br />
        <Custom_power_up usrSocket={props.usrSocket} />
        <br />
      </>
    );
  } else {
    resetGlobalSettings();
    props.usrSocket.emit("edit_settings", { ...globalSettings });
    return <></>;
  }
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

interface IPowerUp {
  type: string;
  user: string;
  imageURL: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  active: boolean;
  lifespan: number;
}

const SettingGame = (props: {
  socketService: { socket: any };
  id: string;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  isGameStarted: boolean;
  /*typeGame: string;*/
  /*setTypeGame: React.Dispatch<React.SetStateAction<string>>;*/
  powerUpList: IPowerUp[];
  side: number;
  roomName: string;
}) => {
  const [errorCode, setErrorCode] = useState<number>(200);
  const [usr1, setUsr1] = useState<string>("");
  const [usr2, setUsr2] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");
  const url = useParams().id as string;
  // console.log(useParams())
  //console.log(useParams())
  //console.log(url)
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
          .catch((err: string) => {
            setErrorText(err);
            console.log("joining room " + err);
            setErrorCode(1);
            props.socketService.socket?.off("join_game_success");
          });
      };
      game();
      console.log("joined from game component");
      console.log("url");
      console.log(url);
    }
    console.log("Game room mounting");
    return () => {
      console.log("Game room unmount");
      props.socketService.socket?.emit("leave_game", { roomId: props.id });
      props.socketService.socket?.off("join_game_success");
      props.socketService.socket?.off("join_game_error");
    };
  }, [props.socketService.socket, url]);

  useEffect(() => {
    props.socketService.socket.on(
      "user_leave_room",
      (res: { username: string }) => {
        console.log(res);
        if (res && res.username === usr1) {
          setUsr1("");
        }
        if (res && res.username === usr2) {
          setUsr2("");
        }
      }
    );
    return () => {
      props.socketService.socket?.off("user_leave_room");
    };
  }, [usr1, usr2, url]);

  const [custom, setCustom] = useState<boolean>(false);
  const [rdy, setRdy] = useState<boolean>(false);
  if (!props.isGameStarted) {
    return (
      <>
        {errorCode >= 400 && <FetchError code={errorCode} />}
        <div className="createParty">
          <h1 className="room_name">{props.roomName}</h1>
          {errorCode != 1 ? (
            <h1>waiting for opponent</h1>
          ) : (
            <h1>Error : {errorText}</h1>
          )}
          {errorCode != 1 && (
            <>
              <ListUser usr1={usr1} usr2={usr2} />
              <ButtonIsCustom
                usrSocket={props.socketService.socket}
                id={props.id}
                setRdy={setRdy}
                custom={custom}
                setCustom={setCustom}
              />
              <br />
              <ButtonRdy
                usrSocket={props.socketService.socket}
                uid={props.id}
                usr1={usr1}
                usr2={usr2}
                rdy={rdy}
                setRdy={setRdy}
                custom={custom}
                setCustom={setCustom}
              />
            </>
          )}
        </div>
      </>
    );
  } else {
    return (
      <>
        {errorCode >= 400 && <FetchError code={errorCode} />}
        <div className="game_container">
          <h1 className="room_name">{props.roomName}</h1>
          <div className="game">
            <canvas
              ref={props.canvasRef}
              className="game_canvas"
              id="pong"
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
            ></canvas>
            <ActivePowerUpsList
              powerUps={props.powerUpList}
              side={props.side}
            />
          </div>
        </div>
      </>
    );
  }
};

export default SettingGame;
