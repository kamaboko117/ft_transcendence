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

    @SubscribeMessage('join_game')
    async handleEvent(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        console.log('New user joining room: ', data);
        
        const connectedSockets = this.server.sockets.adapter.rooms.get(data.roomId);
        const socketRooms = Array.from(client.rooms.values()).filter((r) => r !== client.id);

        if (socketRooms.length > 0 || connectedSockets?.size > 1) {
            client.emit('join_game_error', { error: 'Room is full' });
            return;
        } else {
            await client.join(data.roomId);
            client.emit('join_game_success', { roomId: data.roomId });
        }
    }
}