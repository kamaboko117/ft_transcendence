import React, { useEffect, useRef } from "react";
import gameService from "../../services/gameService";
//import socketService from "../../services/socketService";

const FPS = 60;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;


export default function Game(props: {id: string, usrSocket}) {
  let socketService = {socket: props.usrSocket}
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

  const [side, setSide] = React.useState(1);
  const [isGameStarted, setIsGameStarted] = React.useState(false);
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
    ctx.font = "75px fantasy";
    ctx.fillText(text, x, y);
  }

  function drawNet(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i <= CANVAS_HEIGHT; i += 15) {
      drawRect(ctx, CANVAS_WIDTH / 2 - 1, i, 2, 10, "WHITE");
    }
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
        console.log(data);
        player.y = side === 1 ? data.player2.y : data.player1.y;
        player1.score = data.player1.score;
        player2.score = data.player2.score;
        ball.x = data.ball.x;
        ball.y = data.ball.y;
        ball.velocityX = data.ball.velocityX;
        ball.velocityY = data.ball.velocityY;
      });
    }
  };

  function movePaddle(e: any) {
    let rect = canvasRef.current?.getBoundingClientRect();
    let player = side === 1 ? player1 : player2;
    if (!rect) return;
    player.y = e.clientY - rect.top - player.height / 2;
    if (socketService.socket)
      gameService.updatePlayerPosition(socketService.socket, { side: side, y: player.y });
  }

  useEffect(() => {
    console.log(socketService.socket)
    if (socketService.socket) {
      console.log("socketed")
      const game = async () => {
        await gameService
          .joinGameRoom(socketService.socket, props.id)
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
      socketService.socket?.emit("leave_game", {roomId: props.id});
      socketService.socket?.off("join_game_success");
      socketService.socket?.off("join_game_error");
    });
  }, [socketService.socket]);

  useEffect(() => {
    handleGameStart();
    const canvas = canvasRef.current;
    //if (!canvas) {
    //  return;
    //}
    console.log("canvas")
    console.log(canvas)
    console.log(isGameStarted)
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      function game() {
        if (!ctx) return;
        render(ctx, player1, player2);
      }
      console.log("d");
      canvas.addEventListener("mousemove", movePaddle);
      setInterval(game, 1000 / FPS);
      handleReceivedUpdate();
    }
    return (() => {
      console.log("canvas unmount")
      socketService.socket?.off("on_game_update");
      socketService.socket?.off("onGameStart");
    });
  }, [isGameStarted, socketService.socket]);

  const handleGameStart = async () => {
    if (socketService.socket) {
      await gameService.onGameStart(socketService.socket, (data: any) => {
        console.log("data")
        console.log(data)
        setSide(data.side);
        setIsGameStarted(true);
        console.log("start");
      });
    }
  };

  if (!isGameStarted) {
    return (
      <div className="game">
        <h1 className="room_name">Game</h1>
        {(errorCode != 1 ?<h1>waiting for opponent</h1>: <h1>Room is full, you are spectator</h1>)}
      </div>
    );
  }

  return (
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
  );
}
