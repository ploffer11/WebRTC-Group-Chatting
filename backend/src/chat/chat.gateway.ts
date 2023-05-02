import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/ws-auth.guard';
import { WebSocketServerType, WebSocketType } from './chat.types';
import { ChatService } from './chat.service';

/**
 * Server - Client Socket API
 * - connect
 * just verify Jwt and assign client.data.
 * if jwt is invalid, UnauthorizedException throwed.
 * - enter {roomId: string}
 * if client enter to room, client emit "enter" event to room.
 * if room existed, server emit "enter" event to all clients in the room.
 * if room not existed, server make the room.
 * - chat {roomId: string, message: string}
 * if client chat the message, client emit "chat" event to room.
 * - leave {roomId: string}
 * if client leave the room, client emit "leave" event to roo.
 * - disconnect
 * if client is disconnected from server, client emit "disconnect" event.
 * client leaves all chatroom
 */

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsAuthGuard)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: WebSocketServerType;

  constructor(public chatService: ChatService) {}

  afterInit() {
    console.log('Gateway initialized');
  }

  handleConnection(@ConnectedSocket() client: WebSocketType) {
    console.log('connect:', client.id);
  }

  @SubscribeMessage('enter')
  handleEnter(
    @ConnectedSocket() client: WebSocketType,
    @MessageBody() { roomId },
  ) {
    const { username } = client.data.user;

    if (this.chatService.enter(roomId, client)) {
      this.server.emit('enter', {
        username,
        message: `enter ${username}`,
      });
    }
  }

  @SubscribeMessage('chat')
  handleChat(
    @ConnectedSocket() client: WebSocketType,
    @MessageBody()
    { roomId, message },
  ) {
    console.log(roomId, message);
    const { username } = client.data.user;
    this.server.to(roomId).emit('chat', {
      username,
      message,
    });
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: WebSocketType,
    @MessageBody()
    { roomId }: { roomId: string },
  ) {
    this.chatService.leave(roomId, client);
  }

  handleDisconnect(@ConnectedSocket() client: WebSocketType) {
    console.log('disconnect:', client.id);
    client.rooms.forEach((roomId) => {
      this.chatService.leave(roomId, client);
    });
  }
}
