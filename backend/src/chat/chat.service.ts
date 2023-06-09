import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { IUserTag } from '@schema/auth';
import { IChatroom } from '@schema/chatroom';

import { WebSocketServerType, WebSocketType } from './chat.types';
import { Chatroom } from './chatroom';
import { CreateChatroomReqDto, PatchChatroomReqDto } from './dto/chat.dto';

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
  private create(createChatroomDto: CreateChatroomReqDto, user: IUserTag) {
    const { roomName, maxUserCount, isTextOnly } = createChatroomDto;

    const newRoom = new Chatroom(roomName, user, maxUserCount, isTextOnly);

    this.chatRooms.set(newRoom.roomId, newRoom);
    return newRoom;
  }

  /**
   * Find all existing chatrooms.
   *
   * @returns All chatrooms array.
   */
  private findAll(): Chatroom[] {
    return [...this.chatRooms.values()];
  }

  /**
   * Find a chatroom.
   *
   * @param roomId room id
   * @returns chatroom with `roomId`.
   */
  private find(roomId: string): Chatroom | undefined {
    const room = this.chatRooms.get(roomId);
    return room;
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

  createChatroom(
    createChatroomDto: CreateChatroomReqDto,
    user: IUserTag,
  ): Chatroom {
    return this.create(createChatroomDto, user);
  }

  findAllChatrooms(): Chatroom[] {
    return this.findAll();
  }

  findChatroom(roomId: string): IChatroom {
    const room = this.find(roomId);

    if (!room) throw new NotFoundException('Room not found');

    return room.serialize();
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
  ): IChatroom {
    const room = this.find(roomId);

    if (!room) throw new BadRequestException('Invalid roomId');

    if (room.hostUser.username !== user.username) {
      throw new UnauthorizedException('User is not host');
    }

    Object.assign(room, patchChatroomReqDto);

    return room.serialize();
  }

  /**
   * delete chatroom by using patchChatroomReqDto
   *
   * @param roomId
   * @returns true if deleted, throw exception otherwise
   */
  deleteChatroom(roomId: string, user: IUserTag): boolean {
    const room = this.find(roomId);

    if (!room) throw new BadRequestException('Invalid roomId');

    if (room.hostUser.username !== user.username) {
      throw new UnauthorizedException('User is not host');
    }

    room.close();
    this.chatRooms.delete(roomId);

    return true;
  }

  /**
   * Enter a client into the chatroom.
   *
   * @param roomId room id.
   * @param client websocket client
   * @returns `true` if success, `false` otherwise.
   */
  async enter(roomId: string, client: WebSocketType) {
    const chatRoom = this.find(roomId);
    if (!chatRoom) throw new WsException('Chatroom not found');

    const { user } = client.data;
    if (!user) throw new WsException('Cannot read user data');

    if (!(chatRoom.canAccept(user) && chatRoom.enter(user))) {
      return false;
    }

    await client.join(roomId);

    this.toRoom(roomId).emit('users', { users: chatRoom.getUsers() });

    return true;
  }

  chat(chatText: string, client: WebSocketType) {
    const [, roomId] = client.rooms;
    const { user } = client.data;

    if (!user) throw new WsException('Cannot read user data');

    this.toRoom(roomId).emit('chat', {
      user,
      chatText,
    });
  }

  offer(toSocketId: string, offer: unknown, client: WebSocketType) {
    const fromSocketId = client.id;

    this.toRoom(toSocketId).emit('offer', {
      fromSocketId,
      offer,
    });
  }

  answer(toSocketId: string, answer: unknown, client: WebSocketType) {
    const fromSocketId = client.id;

    this.toRoom(toSocketId).emit('answer', {
      fromSocketId,
      answer,
    });
  }

  candidate(toSocketId: string, candidate: unknown, client: WebSocketType) {
    const fromSocketId = client.id;

    this.toRoom(toSocketId).emit('candidate', {
      fromSocketId,
      candidate,
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
    const chatRoom = this.find(roomId);
    if (!chatRoom) throw new WsException('Chatroom not found');

    const { user } = client.data;
    if (!user) throw new WsException('Cannot read user data');

    if (!chatRoom.leave(user)) {
      return false;
    }

    await client.leave(roomId);

    this.toRoom(roomId).emit('users', { users: chatRoom.getUsers() });

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
      this.leave(roomId, client).catch((err) => {
        console.error(err);
      });
    });
  }
}
