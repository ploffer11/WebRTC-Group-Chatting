import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { WebSocketServerType, WebSocketType } from './chat.types';
import { Chatroom } from './chatroom';
import { CreateChatroomReqDto, PatchChatroomReqDto } from './dto/chat.dto';
import { IUserTag } from '../../../schema/auth';

@Injectable()
export class ChatService {
  chatRooms: Map<string, Chatroom> = new Map();
  server!: WebSocketServerType;

  /**
   * Create a new room.
   *
   * @param createChatroomDto
   * @returns a new chatroom which has given `createChatroomDto`
   */
  createChatroom(
    createChatroomDto: CreateChatroomReqDto,
    user: IUserTag,
  ): Chatroom {
    const { roomName, maxUserCount, isTextOnly } = createChatroomDto;

    const newRoom = new Chatroom(roomName, user, maxUserCount, isTextOnly);

    this.chatRooms.set(newRoom.roomId, newRoom);
    return newRoom;
  }

  /**
   * Find all existed chatrooms.
   *
   * @returns All chatrooms array.
   */
  findAllChatrooms(): Chatroom[] {
    return [...this.chatRooms.values()];
  }

  /**
   * Find a chatroom.
   *
   * @param roomId room id
   * @returns chatroom with `roomId`.
   */
  findChatroom(roomId: string): Chatroom {
    const room = this.chatRooms.get(roomId);
    if (!room) {
      throw new BadRequestException('Invalid roomId.');
    }
    return room;
  }

  /**
   * patched chatroom by using patchChatroomReqDto
   *
   * @param roomId
   * @param patchChatroomReqDto
   * @returns patched room
   */
  patchChatroom(
    roomId: string,
    user: IUserTag,
    patchChatroomReqDto: PatchChatroomReqDto,
  ): Chatroom {
    const room = this.findChatroom(roomId);

    if (!(room.hostUser.username === user.username)) {
      throw new UnauthorizedException('User is not host');
    }

    Object.assign(room, patchChatroomReqDto);

    return room;
  }

  /**
   * delete chatroom by using patchChatroomReqDto
   *
   * @param roomId
   * @returns true if deleted, throw exception otherwise
   */
  deleteChatroom(roomId: string, user: IUserTag): boolean {
    const room = this.findChatroom(roomId);

    if (!(room.hostUser.username === user.username)) {
      throw new UnauthorizedException('User is not host');
    }

    room.close();
    this.chatRooms.delete(roomId);

    return true;
  }

  /**
   * Target specific room(s).
   *
   * @param room room ids
   * @returns union of every rooms
   */
  private toRoom(...rooms: string[]) {
    if (rooms.length === 0) return this.server;
    const [firstRoomId] = rooms;

    return rooms.reduce(
      (roomUnion, roomId) => roomUnion.to(roomId),
      this.server.to(firstRoomId),
    );
  }

  /**
   * Enter a client into the chatroom.
   *
   * @param roomId room id.
   * @param client websocket client
   * @returns `true` if success, `false` otherwise.
   */
  async enter(roomId: string, client: WebSocketType) {
    const chatRoom = this.findChatroom(roomId);

    if (!chatRoom) {
      throw new WsException('Chatroom not found');
    }

    const { user } = client.data;

    if (!user) {
      throw new WsException('Cannot read user data');
    }

    if (!(chatRoom?.canAccept(user) && chatRoom?.enter(user))) {
      return false;
    }

    await client.join(roomId);
    this.toRoom(roomId).emit('enter', {
      roomId,
      user,
    });

    return true;
  }

  chat(chatText: string, client: WebSocketType) {
    const [roomId] = client.rooms;
    const { user } = client.data;

    if (!user) throw new WsException('Cannot read user data');

    this.toRoom(roomId).emit('chat', {
      user,
      chatText,
    });
  }

  /**
   * Leave this client from a chatroom
   *
   * @param roomId room id
   * @param client websocket client
   * @returns `true` if success, `false` otherwise.
   */
  async leave(roomId: string, client: WebSocketType) {
    const chatRoom = this.findChatroom(roomId);
    const { user } = client.data;

    if (!user) throw new WsException('Cannot read user data');

    if (!chatRoom?.leave(user)) {
      return false;
    }

    await client.leave(roomId);

    this.toRoom(roomId).emit('leave', {
      roomId,
      user,
    });

    return true;
  }

  /**
   * Cleanup this websocket client.
   * @details leave all room that this websocket client has joined in.
   *
   * @param client websocket client
   */
  leaveAll(client: WebSocketType) {
    client.rooms.forEach((roomId) => {
      this.leave(roomId, client);
    });
  }
}
