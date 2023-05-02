import { WebSocketServerType, WebSocketType } from './chat.types';

export class Chatroom {
  server: WebSocketServerType;

  roomId: string;
  roomName: string;

  userIds: string[] = [];
  maxCapacity = 6;

  constructor(roomId: string, server: WebSocketServerType) {
    this.server = server;
    this.roomId = roomId;
    this.roomName = `room-${roomId}`;
  }

  enter(userId: string, userName: string, client: WebSocketType): boolean {
    if (this.userIds.length >= this.maxCapacity) return false;

    this.userIds.push(userId);
    client.join(this.roomName);
    this.server.to(this.roomName).emit('enter', {
      userId,
      userName,
      message: `${userName}님이 입장했습니다.`,
    });

    return true;
  }

  chat(userId: string, userName: string, message: string) {
    this.server.to(this.roomName).emit('chat', {
      userId,
      userName,
      message,
    });
  }

  leave(userId: string, userName: string) {
    if (!this.userIds.includes(userId)) return false;

    this.userIds.splice(this.userIds.indexOf(userId), 1);
    this.server.to(this.roomName).emit('leave', {
      userId,
      userName,
      message: `${userName}님이 퇴장했습니다.`,
    });
  }
}
