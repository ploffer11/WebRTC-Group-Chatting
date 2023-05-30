import { randomUUID } from 'crypto';

import { IUserTag } from '@schema/auth';
import { IChatroom } from '@schema/chatroom';
import { IWebsocketUser } from '@schema/ws';

export class Chatroom implements IChatroom {
  users: Set<IWebsocketUser> = new Set();
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
    if (this.users.has(user)) {
      // TODO: uncomment this line
      // return false;
      return true;
    }

    return true;
  }

  enter(user: IWebsocketUser): boolean {
    this.users.add(user);
    return true;
  }

  leave(user: IWebsocketUser) {
    this.users.delete(user);
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
