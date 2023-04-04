import { Module, forwardRef } from '@nestjs/common';
import { RoomsModule } from 'src/rooms/rooms.module';
import { UsersModule } from 'src/users/users.module';
import { SocketEvents } from './socketEvents';

@Module({
    imports: [forwardRef(() => RoomsModule), UsersModule, ],
    providers: [SocketEvents],
    exports: [SocketEvents]
})
export class SocketModule {}