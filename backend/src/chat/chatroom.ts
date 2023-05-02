import { WebSocketType } from './chat.types';

export class Chatroom {
  userIds: string[] = [];
  maxCapacity = 6;

  get usersCount() {
    return this.userIds.length;
  }

  constructor(
    public roomId: string,
    public roomName: string = `room-${roomId}`,
  ) {}

  canAccept(client: WebSocketType) {
    const { username } = client.data.user;

    if (this.usersCount >= this.maxCapacity) return false;
    if (this.userIds.includes(username)) {
      // TODO: uncomment this line
      // return false;
      return true;
    }

    return true;
  }

  enter(client: WebSocketType): boolean {
    const { username } = client.data.user;

    this.userIds.push(username);
    client.join(this.roomName);

    return true;
  }

  leave(client: WebSocketType) {
    const { username } = client.data.user;

    this.userIds.splice(this.userIds.indexOf(username), 1);
  }
}
