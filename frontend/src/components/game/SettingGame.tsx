import React, { useEffect, useState } from "react";
import gameService from "../../services/gameService";
import { FetchError } from "../FetchError";
import ActivePowerUpsList from "./ActivePowerUpsList";
import { useParams } from "react-router-dom";
import { Socket } from "socket.io-client";

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
  usrSocket: Socket<any, any>;
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
  usrSocket: Socket<any, any>;
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

const Custom_size_ball = (props: { usrSocket: Socket<any, any> }) => {
  const [size, setSize] = useState<string>("10");
  const handleChange = (e: any) => {
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
    <div className="setting_row">
      <label className="setting_title">
        <b>Ball Size</b>
      </label>
      <div className="setting_choice_group">
        <button
          className={size === "5" ? "setting_choice_active" : "setting_choice"}
          onClick={handleChange}
          value={5}
          name="size_ball"
        >
          Small
        </button>
        <button
          className={size === "10" ? "setting_choice_active" : "setting_choice"}
          onClick={handleChange}
          value={10}
          name="size_ball"
        >
          Normal
        </button>
        <button
          className={size === "20" ? "setting_choice_active" : "setting_choice"}
          onClick={handleChange}
          value={20}
          name="size_ball"
        >
          Big
        </button>
      </div>
    </div>
  );
};

const Custom_speed_ball = (props: { usrSocket: Socket<any, any> }) => {
  const [speed, setSpeed] = useState<string>("5");
  const handleChange = (e: any) => {
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
    <div className="setting_row">
      <label className="setting_title">
        <b>Ball Speed</b>
      </label>
      <div className="setting_choice_group">
        <button
          className={speed === "3" ? "setting_choice_active" : "setting_choice"}
          onClick={handleChange}
          // type="radio"
          value={3}
          name="speed_ball"
          // checked={speed === "3"}
        >
          Slow
        </button>
        {/* <label>Slow</label> */}
        <button
          className={speed === "5" ? "setting_choice_active" : "setting_choice"}
          onClick={handleChange}
          // type="radio"
          value={5}
          name="speed_ball"
          // checked={speed === "5"}
        >
          Average
        </button>
        {/* <label>Average</label> */}
        <button
          className={
            speed === "10" ? "setting_choice_active" : "setting_choice"
          }
          onClick={handleChange}
          // type="radio"
          value={10}
          name="speed_ball"
          // checked={speed === "10"}
        >
          Fast
        </button>
        {/* <label>Fast</label> */}
      </div>
    </div>
  );
};

const Custom_acceleration_ball = (props: { usrSocket: Socket<any, any> }) => {
  const [acc, setAcc] = useState<string>("0.1");
  const handleChange = (e: any) => {
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
    <div className="setting_row">
      <label className="setting_title">
        <b>Ball Acceleration</b>
      </label>
      <div className="setting_choice_group">
        <button
          className={acc === "0.1" ? "setting_choice_active" : "setting_choice"}
          onClick={handleChange}
          value={0.1}
          name="acc_ball"
        >
          Normal
        </button>
        <button
          className={acc === "0.2" ? "setting_choice_active" : "setting_choice"}
          onClick={handleChange}
          value={0.2}
          name="acc_ball"
        >
          Speed
        </button>
        <button
          className={acc === "0.4" ? "setting_choice_active" : "setting_choice"}
          onClick={handleChange}
          value={0.4}
          name="acc_ball"
        >
          Sonic
        </button>
      </div>
    </div>
  );
};

const Custom_goal = (props: { usrSocket: Socket<any, any> }) => {
  const [goal, setGoal] = useState<string>("11");
  const handleChange = (e: any) => {
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
    <div className="setting_row">
      <label className="setting_title">
        <b>Score to Win</b>
      </label>
      <div className="setting_choice_group">
        <button
          className={goal === "5" ? "setting_choice_active" : "setting_choice"}
          onClick={handleChange}
          value={11}
          name="goal_ball"
        >
          Normal
        </button>
        <button
          className={goal === "11" ? "setting_choice_active" : "setting_choice"}
          onClick={handleChange}
          value={21}
          name="goal_ball"
        >
          Long
        </button>
        <button
          className={goal === "20" ? "setting_choice_active" : "setting_choice"}
          // style={ "width: 100px" }
          onClick={handleChange}
          value={42}
          name="goal_ball"
        >
          Transcendence
        </button>
      </div>
    </div>
  );
};

const Custom_color_ball = (props: { usrSocket: any }) => {
  const [color, setColor] = useState<string>("WHITE");
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
    <div className="setting_row">
      <label className="setting_title">
        <b>Color Ball</b>
      </label>
      <br />
      <select name="color_ball" onChange={handleChange}>
        <option value={"WHITE"} selected={color === "WHITE"}>
          WHITE
        </option>
        <option value={"RED"} selected={color === "RED"}>
          RED
        </option>
        <option value={"GREEN"} selected={color === "GREEN"}>
          GREEN
        </option>
        <option value={"BLUE"} selected={color === "BLUE"}>
          BLUE
        </option>
        <option value={"YELLOW"} selected={color === "YELLOW"}>
          YELLOW
        </option>
        <option value={"PURPLE"} selected={color === "PURPLE"}>
          PURPLE
        </option>
        <option value={"ORANGE"} selected={color === "ORANGE"}>
          ORANGE
        </option>
        <option value={"PINK"} selected={color === "PINK"}>
          PINK
        </option>
        <option value={"BROWN"} selected={color === "BROWN"}>
          BROWN
        </option>
      </select>
    </div>
  );
};

const Custom_power_up = (props: { usrSocket: Socket<any, any> }) => {
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const handleCheck = (e: any) => {
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
    <div className="setting_row">
      <label className="setting_title">
        <b>Power Ups</b>
      </label>
      <button
        className={isCheck ? "setting_choice_active" : "setting_choice"}
        onClick={handleCheck}
        // type="checkbox"
        name="Power_Up"
        value="powerUp"
        // checked={isCheck}
      >
        {isCheck ? "ON" : "OFF"}
      </button>
    </div>
  );
};

const Custom_setting = (props: {
  cst: boolean;
  usrSocket: Socket<any, any>;
  id: string;
}) => {
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
      <div className="settings_container">
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
      </div>
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
