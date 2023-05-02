import { IUserTag } from './auth';

interface ServerToClientEvents {
  enter: (opts: { username: string; message: string }) => void;
  chat: (opts: { username: string; message: string }) => void;
  leave: (opts: { username: string; message: string }) => void;
}

interface ClientToServerEvents {
  enter: (opts: {}) => void;
  chat: (opts: { roomId: string; message: string }) => void;
}

interface InterServerEvents {}

interface SocketData {
  user: IUserTag;
}

export {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
};
