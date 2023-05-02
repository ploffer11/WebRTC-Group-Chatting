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

import { UseGuards, ValidationPipe } from '@nestjs/common';
import { WsAuthGuard } from '../auth/ws-auth.guard';
import { WebSocketServerType, WebSocketType } from './chat.types';
import { ChatService } from './chat.service';
import {
  ChatroomEnterDto,
  ChatroomLeaveDto,
  ChatroomChatDto,
} from './dto/chat.dto';

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
    this.chatService.server = this.server;
  }

  handleConnection(@ConnectedSocket() client: WebSocketType) {
    console.log('connect:', client.id);
  }

  @SubscribeMessage('enter')
  handleEnter(
    @ConnectedSocket() client: WebSocketType,
    @MessageBody(new ValidationPipe()) { roomId }: ChatroomEnterDto,
  ) {
    this.chatService.enter(roomId, client);
  }

  @SubscribeMessage('chat')
  handleChat(
    @ConnectedSocket() client: WebSocketType,
    @MessageBody()
    { chatText }: ChatroomChatDto,
  ) {
    this.chatService.chat(chatText, client);
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: WebSocketType,
    @MessageBody()
    { roomId }: ChatroomLeaveDto,
  ) {
    this.chatService.leave(roomId, client);
  }

  handleDisconnect(@ConnectedSocket() client: WebSocketType) {
    this.chatService.leaveAll(client);
  }
}
