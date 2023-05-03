import { IUserTag } from '../../../schema/auth';

export class Chatroom {
  userIds: Set<string> = new Set();
  maxCapacity = 6;

  get usersCount() {
    return this.userIds.size;
  }

  constructor(
    public roomId: string,
    public roomName: string = `room-${roomId}`,
  ) {}

  canAccept({ username }: IUserTag) {
    if (this.usersCount >= this.maxCapacity) return false;
    if (this.userIds.has(username)) {
      // TODO: uncomment this line
      // return false;
      return true;
    }

    return true;
  }

  enter({ username }: IUserTag): boolean {
    this.userIds.add(username);

    return true;
  }

  leave({ username }: IUserTag) {
    this.userIds.delete(username);
    return true;
  }
}
