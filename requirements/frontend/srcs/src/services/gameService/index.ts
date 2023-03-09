import { Socket } from "socket.io-client";

class GameService {
  public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      socket.emit("join_game", { roomId });
      socket.on("join_game_success", () => resolve(true));
      socket.on("join_game_error", ({ error }) => reject(error));
    });
  }

  public async updateGame(socket: Socket, data: any): Promise<void> {
    socket.emit("update_game", data);
  }

  public async onGameUpdate(
    socket: Socket,
    callback: (data: any) => void
  ): Promise<void> {
    socket.on("on_game_update", callback);
  }

  public async onGameStart(
    socket: Socket,
    callback: (data: any) => void
  ): Promise<void> {
    socket.on("start_game", callback);
  }
}

export default new GameService();
