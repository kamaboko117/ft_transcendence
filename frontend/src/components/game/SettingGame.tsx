import React, { useEffect, useState } from "react";
import gameService from "../../services/gameService";
import { FetchError } from "../FetchError";
import ActivePowerUpsList from "./ActivePowerUpsList";
import { useParams } from "react-router-dom";

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

const ButtonIsCustom = (props: {
  usrSocket,
  id: string,
  setRdy: React.Dispatch<React.SetStateAction<boolean>>,
  custom: boolean,
  setCustom: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  //const [custom, setCustom] = useState<boolean>(false);
  const handleRdy = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e && e.target) props.setCustom((prev) => !prev);
  };

  useEffect(() => {
    props.usrSocket.on("updateTypeGameFromServer", (res: { type: boolean }) => {
      props.setRdy(false);
      props.setCustom(res.type);
      console.log(res.type)
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
        console.log(res.type)
        props.setRdy(false);
        props.setCustom(res.type);
      }
    );
  }, [props.custom]);

  return (
    <button onClick={handleRdy}>
      {props.custom === false
        ? "Click to transform into custom game"
        : "Click to disable custom game"}
    </button>
  );
};

const ButtonRdy = (props: {
  usrSocket,
  uid: string,
  usr1: string,
  usr2: string,
  rdy: boolean,
  setRdy: React.Dispatch<React.SetStateAction<boolean>>,
  custom: boolean,
  setCustom: React.Dispatch<React.SetStateAction<boolean>>
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
      custom: props.custom
    });
  }, [props.rdy]);
  return (
    <button onClick={handleRdy}>
      {props.rdy === false ? "Click to be ready" : "Stop ready"}
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
}) => {
  const [errorCode, setErrorCode] = useState<number>(200);
  const [usr1, setUsr1] = useState<string>("");
  const [usr2, setUsr2] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");
  const url = useParams().id as string;
  console.log(useParams())
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
      console.log("url")
      console.log(url)
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
  }, [usr1, usr2, url]);

  const [custom, setCustom] = useState<boolean>(false);
  const [rdy, setRdy] = useState<boolean>(false);
  if (!props.isGameStarted) {
    return (
      <>
        {errorCode >= 400 && <FetchError code={errorCode} />}
        <div className="createParty">
          <h1 className="room_name">Game</h1>
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
          <h1 className="room_name">Game</h1>
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
