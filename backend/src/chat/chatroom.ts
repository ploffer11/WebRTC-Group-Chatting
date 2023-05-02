import { WebSocketType } from './chat.types';

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

  canAccept(client: WebSocketType) {
    const { username } = client.data.user;

    if (this.usersCount >= this.maxCapacity) return false;
    if (this.userIds.has(username)) {
      // TODO: uncomment this line
      // return false;
      return true;
    }

    return true;
  }

  enter(client: WebSocketType): boolean {
    const { username } = client.data.user;

    this.userIds.add(username);

    return true;
  }

  leave(client: WebSocketType) {
    const { username } = client.data.user;

    this.userIds.delete(username);
    return true;
  }
}
