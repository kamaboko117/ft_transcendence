import { io, Socket } from "socket.io-client";

class SocketService {
  public socket: Socket | null = null;

  /*  public connect(url: string): Promise<Socket> {
      return new Promise((resolve, reject) => {
        this.socket = io(url);
        if (!this.socket) {
          return reject("Socket is not initialized");
        }
        this.socket.on("connect", () => {
          resolve(this.socket as Socket);
        });
        this.socket.on("connect_error", (err: any) => {
          console.log("connect_error", err);
          reject(err);
        });
      });
    }*/
}

export default new SocketService();
