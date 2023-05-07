import { randomUUID } from 'crypto';

import { IUserTag } from '@schema/auth';
import { IChatroom } from '@schema/chatroom';

export class Chatroom implements IChatroom {
  userIds: Set<string> = new Set();
  currentUserCount = 0;
  roomId = '';

  constructor(
    public roomName: string,
    public hostUser: IUserTag,
    public maxUserCount: number,
    public isTextOnly: boolean,
  ) {
    this.roomId = randomUUID();
  }

  canAccept({ username }: IUserTag) {
    if (this.currentUserCount >= this.maxUserCount) return false;
    if (this.userIds.has(username)) {
      // TODO: uncomment this line
      // return false;
      return true;
    }

    return true;
  }

  enter({ username }: IUserTag): boolean {
    this.userIds.add(username);
    this.currentUserCount++;
    return true;
  }

  leave({ username }: IUserTag) {
    this.userIds.delete(username);
    this.currentUserCount--;
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
