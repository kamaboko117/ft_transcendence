import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gameService from "../../services/gameService";
import ActivePowerUpsList from "./ActivePowerUpsList";
import { FetchError, header } from "../FetchError";
import SettingGame from "./SettingGame";
//import socketService from "../../services/socketService";

const FPS = 60;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

export default function Game(props: {
  id: string;
  usrSocket;
  roomName: string;
  jwt: string | null;
}) {
  let socketService = { socket: props.usrSocket };
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  interface IPlayer {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    score: number;
    top: number;
    bottom: number;
    left: number;
    right: number;
  }

  const navigate = useNavigate();
  useEffect(() => {
    const ft_fetch = async () => {
      await fetch(
        "https://" +
          location.host +
          "/api/rooms/get?" +
          new URLSearchParams({
            id: props.id,
          }),
        { headers: header(props.jwt) }
      )
        .then((res) => {
          if (res.ok) return res.json();
          setErrorCode(res.status);
        })
        .then((res: { exist: boolean }) => {
          if (res) {
            if (res.exist === false) navigate("/");
          }
        })
        .catch((e) => console.log(e));
    };
    ft_fetch();
  }, [props.jwt]);

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

  let powerUps: IPowerUp[] = [];
  const [powerUpList, setPowerUpList] = React.useState<IPowerUp[]>([]);
  const [intervalID, setIntervalID] = React.useState<number | null>(null);
  const [side, setSide] = React.useState(1);
  const [isGameStarted, setIsGameStarted] = React.useState(false);
  const [typeGame, setTypeGame] = React.useState<string>("normal");
  const [isGameEnded, setIsGameEnded] = React.useState(false);
  const [winner, setWinner] = React.useState<string>("");
  const [errorCode, setErrorCode] = React.useState<number>(200);

  function drawRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string
  ) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function drawCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    color: string
  ) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  }

  function drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color: string
  ) {
    ctx.fillStyle = color;
    ctx.font = "75px arial";
    ctx.fillText(text, x, y);
  }

  function drawPowerUps(ctx: CanvasRenderingContext2D) {
    for (const powerUp of powerUps) {
      if (!powerUp.active) {
        drawCircle(ctx, powerUp.x, powerUp.y, powerUp.radius, powerUp.color);
        let powerUpImage = new Image();
        powerUpImage.src = powerUp.imageURL;
        drawImageResized(
          ctx,
          powerUpImage,
          powerUp.x - powerUp.radius,
          powerUp.y - powerUp.radius,
          powerUp.radius * 2,
          powerUp.radius * 2
        );
      }
    }
  }

  function drawNet(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i <= CANVAS_HEIGHT; i += 15) {
      drawRect(ctx, CANVAS_WIDTH / 2 - 1, i, 2, 10, "WHITE");
    }
  }

  function drawImageResized(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    ctx.drawImage(img, x, y, w, h);
  }

  const player1 = {
    x: 0,
    y: CANVAS_HEIGHT / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: "WHITE",
    score: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };
  const player2 = {
    x: CANVAS_WIDTH - 10,
    y: CANVAS_HEIGHT / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: "WHITE",
    score: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };
  const ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: 10,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: "WHITE",
  };

  function render(
    ctx: CanvasRenderingContext2D,
    player1: IPlayer,
    player2: IPlayer
  ) {
    drawRect(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "BLACK");
    drawPowerUps(ctx);
    drawText(
      ctx,
      `${player1.score}`,
      CANVAS_WIDTH / 4,
      CANVAS_HEIGHT / 5,
      "WHITE"
    );
    drawText(
      ctx,
      `${player2.score}`,
      (3 * CANVAS_WIDTH) / 4,
      CANVAS_HEIGHT / 5,
      "WHITE"
    );
    drawNet(ctx);
    drawRect(
      ctx,
      player1.x,
      player1.y,
      player1.width,
      player1.height,
      player1.color
    );
    drawRect(
      ctx,
      player2.x,
      player2.y,
      player2.width,
      player2.height,
      player2.color
    );
    drawCircle(ctx, ball.x, ball.y, ball.radius, ball.color);
  }

  const handleReceivedUpdate = () => {
    let player = side === 1 ? player2 : player1;
    if (socketService.socket) {
      gameService.onGameUpdate(socketService.socket, (data: any) => {
        player.y = side === 1 ? data.player2.y : data.player1.y;
        player1.score = data.player1.score;
        player2.score = data.player2.score;
        player1.height = data.player1.height;
        player2.height = data.player2.height;
        ball.x = data.ball.x;
        ball.y = data.ball.y;
        ball.radius = data.ball.radius;
        ball.color = data.ball.color;
        ball.velocityX = data.ball.velocityX;
        ball.velocityY = data.ball.velocityY;
        powerUps = data.powerUps;
        setPowerUpList(data.powerUps);
      });
      gameService.onGameEnd(socketService.socket, (data: any) => {
        console.log("Game ended");
        console.log(data);
        setIsGameStarted(false);
        setIsGameEnded(true);
        // console.log(`winner is ${data.winner}`)
        setWinner(data.winner);
      });
    }
  };

  function movePaddle(e: any) {
    let rect = canvasRef.current?.getBoundingClientRect();
    let player = side === 1 ? player1 : player2;
    if (!rect) return;
    player.y = e.clientY - rect.top - player.height / 2;
    if (socketService.socket)
      gameService.updatePlayerPosition(socketService.socket, {
        side: side,
        y: player.y,
      });
  }
  /*
    useEffect(() => {
      console.log(socketService.socket)
      if (socketService.socket) {
        console.log("socketed")
        const game = async () => {
          await gameService
            .joinGameRoom(socketService.socket, props.id, 0, 0)
            .catch((err) => {
              console.log("joining room " + err);
              setErrorCode(1);
            });
        }
        game();
      }
      console.log("joined from game component");
      console.log("Game room mounting");
      return (() => {
        console.log("Game room unmount");
        socketService.socket?.emit("leave_game", { roomId: props.id });
        socketService.socket?.off("join_game_success");
        socketService.socket?.off("join_game_error");
      });
    }, [socketService.socket]);*/

  useEffect(() => {
    handleGameStart();
    const canvas = canvasRef.current;
    //if (!canvas) {
    //  return;
    //}
    console.log("canvas");
    console.log(canvas);
    console.log(isGameStarted);
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      function game() {
        if (!ctx) return;
        render(ctx, player1, player2);
      }
      canvas.addEventListener("mousemove", movePaddle);
      setIntervalID(setInterval(game, 1000 / FPS));
      handleReceivedUpdate();
    }
    return () => {
      console.log("canvas unmount");
      if (intervalID) {
        clearInterval(intervalID);
      }
      canvas?.removeEventListener("mousemove", movePaddle);
      socketService.socket?.off("on_game_update");
      socketService.socket?.off("onGameStart");
    };
  }, [isGameStarted, socketService.socket?.connected]);

  const handleGameStart = async () => {
    if (socketService.socket) {
      console.log("game start HANDL:E");
      await gameService.onGameStart(socketService.socket, (data: any) => {
        console.log("data");
        console.log(data);
        setSide(data.side);
        setIsGameStarted(true);
        console.log("start");
      });
    }
  };

  if (isGameEnded) {
    return (
      <div className="game_container">
        <h1 className="room_name">{props.roomName}</h1>
        <h1 className="room_description">Game ended</h1>
        <h2 className="room_text">{winner} won !</h2>
      </div>
    );
  }

  // if (!isGameStarted) {
  //   return (
  //     <div className="game_container">
  //       <h1 className="room_name">{props.roomName}</h1>
  //       {errorCode != 1 ? (
  //         <h1 className="room_content">waiting for opponent</h1>
  //       ) : (
  //         <h1 className="room_description">Room is full, you are spectator</h1>
  //       )}
  //     </div>
  //   );
  // }

  return (
    <>
      {errorCode >= 400 && <FetchError code={errorCode} />}
      <SettingGame
        id={props.id}
        socketService={socketService}
        canvasRef={canvasRef}
        isGameStarted={isGameStarted}
        typeGame={typeGame}
        setTypeGame={setTypeGame}
        powerUpList={powerUpList}
        side={side}
      />
    </>
  );
  //}

  /*return (
    <div className="game">
      <h1 className="room_name">Game</h1>
      <canvas
        ref={canvasRef}
        className="game_canvas"
        id="pong"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      ></canvas>
    </div>
  );*/
}
