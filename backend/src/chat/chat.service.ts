import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { WebSocketServerType, WebSocketType } from './chat.types';
import { Chatroom } from './chatroom';

@Injectable()
export class ChatService {
  chatRooms: Map<string, Chatroom> = new Map();
  server!: WebSocketServerType;

  /**
   * Create a new room.
   *
   * @param roomId
   * @returns a new chatroom which has given `roomId`.
   */
  create(roomId: string): Chatroom | null {
    if (this.chatRooms.has(roomId)) return null;

    const newRoom = new Chatroom(roomId);
    this.chatRooms.set(roomId, newRoom);
    return newRoom;
  }

  /**
   * Find a chatroom.
   *
   * @param roomId room id
   * @returns chatroom with `roomId`.
   */
  find(roomId: string) {
    return this.chatRooms.get(roomId);
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
    const chatRoom = this.find(roomId) ?? this.create(roomId);
    const { user } = client.data;

    if (!user) throw new WsException('Cannot read user data');

    if (!(chatRoom?.canAccept(user) && chatRoom?.enter(user))) {
      return false;
    }

    await client.join(roomId);
    this.toRoom(roomId).emit('enter', {
      roomId,
      user,
    });

    return false;
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
    const chatRoom = this.find(roomId);
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
