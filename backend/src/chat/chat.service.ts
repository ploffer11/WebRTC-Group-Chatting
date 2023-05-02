import { Injectable } from '@nestjs/common';
import { Chatroom } from './chatroom';
import { WebSocketType } from './chat.types';

@Injectable()
export class ChatService {
  chatRooms: Map<string, Chatroom> = new Map();

  create(roomId: string) {
    const newRoom = new Chatroom(roomId);
    this.chatRooms.set(roomId, newRoom);
    return newRoom;
  }

  find(roomId: string) {
    return this.chatRooms.get(roomId);
  }

  enter(roomId: string, client: WebSocketType) {
    const chatRoom = this.find(roomId) ?? this.create(roomId);

    if (client.rooms.size !== 0) {
      return false;
    }

    if (!chatRoom.canAccept(client)) {
      return false;
    }

    return chatRoom.enter(client);
  }

  leave(roomId: string, client: WebSocketType) {
    const chatRoom = this.find(roomId);
    if (!chatRoom) {
      return false;
    }

    return chatRoom.leave(client);
  }
}
