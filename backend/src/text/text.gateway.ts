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
import { WebSocketServerType, WebSocketType } from './text.types';

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

class Chatroom {
  server: WebSocketServerType;

  roomId: string;
  roomName: string;

  userIds: string[] = [];
  maxCapacity = 6;

  constructor(roomId: string, server: WebSocketServerType) {
    this.server = server;
    this.roomId = roomId;
    this.roomName = `room-${roomId}`;
  }

  enter(userId: string, userName: string, client: WebSocketType): boolean {
    if (this.userIds.length >= this.maxCapacity) return false;

    this.userIds.push(userId);
    client.join(this.roomName);
    this.server.to(this.roomName).emit('enter', {
      userId,
      userName,
      message: `${userName}님이 입장했습니다.`,
    });

    return true;
  }

  chat(userId: string, userName: string, message: string) {
    this.server.to(this.roomName).emit('chat', {
      userId,
      userName,
      message,
    });
  }

  leave(userId: string, userName: string) {
    if (!this.userIds.includes(userId)) return false;

    this.userIds.splice(this.userIds.indexOf(userId), 1);
    this.server.to(this.roomName).emit('leave', {
      userId,
      userName,
      message: `${userName}님이 퇴장했습니다.`,
    });
  }
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsAuthGuard)
export class TextGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: WebSocketServerType;

  madeChatroom: Map<string, Chatroom> = new Map<string, Chatroom>();

  userIdx = 0;

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
    client.on('enter', (opts) => {
      opts;
    });
    const { userId, userName } = client.data;
    const chatroom: Chatroom =
      this.madeChatroom.get(roomId) ?? new Chatroom(roomId, this.server);
    this.madeChatroom.set(roomId, chatroom);
    chatroom.enter(userId, userName, client);
  }

  @SubscribeMessage('chat')
  handleChat(
    @ConnectedSocket() client: WebSocketType,
    @MessageBody()
    {
      roomId,
      message,
    }: {
      roomId: string;
      message: string;
    },
  ) {
    const { userId, userName } = client.data;
    const chatroom = this.madeChatroom.get(roomId);
    chatroom?.chat(userId, userName, message);
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: WebSocketType,
    @MessageBody()
    { roomId }: { roomId: string },
  ) {
    const { userId, userName } = client.data;
    const chatroom = this.madeChatroom.get(roomId);
    chatroom?.leave(userId, userName);
  }

  handleDisconnect(@ConnectedSocket() client: WebSocketType) {
    console.log('disconnect:', client.id);
    const { userId, userName } = client.data;
    [...this.madeChatroom.values()].forEach((chatroom) => {
      chatroom.leave(userId, userName);
    });
  }
}
