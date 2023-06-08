import { randomUUID } from 'crypto';

import { IUserTag } from '@schema/auth';
import { IChatroom } from '@schema/chatroom';
import { IWebsocketUser } from '@schema/ws';

export class Chatroom implements IChatroom {
  users: Map<string, IWebsocketUser> = new Map();
  roomId = '';

  constructor(
    public roomName: string,
    public hostUser: IUserTag,
    public maxUserCount: number,
    public isTextOnly: boolean,
  ) {
    this.roomId = randomUUID();
  }

  get currentUserCount(): number {
    return this.users.size;
  }

  getUsers(): IWebsocketUser[] {
    return [...this.users.values()];
  }

  canAccept(user: IWebsocketUser) {
    if (this.currentUserCount >= this.maxUserCount) return false;
    if (this.users.has(user.socketId)) {
      return false;
    }

    return true;
  }

  enter(user: IWebsocketUser): boolean {
    this.users.set(user.socketId, user);
    return true;
  }

  leave(user: IWebsocketUser) {
    this.users.delete(user.socketId);
    return true;
  }

  // TODO: define close chatroom
  close() {
    return;
  }

  serialize(): IChatroom {
    return {
      roomName: this.roomName,
      roomId: this.roomId,
      currentUserCount: this.currentUserCount,
      maxUserCount: this.maxUserCount,
      isTextOnly: this.isTextOnly,
      hostUser: this.hostUser,
    };
  }
}
