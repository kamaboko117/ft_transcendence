import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageBody, ConnectedSocket }  from '@nestjs/websockets';

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})
export class SocketEvents {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log('Client connected: ', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected: ', client.id);
    }

    @SubscribeMessage('message')
    handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
        console.log('Message: ', data);
        return data;
    }
}