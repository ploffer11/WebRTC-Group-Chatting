import { IUserTag } from './auth';

interface ServerToClientEvents {
  enter: (opts: { userId: string; userName: string; message: string }) => void;
  chat: (opts: { userId: string; userName: string; message: string }) => void;
  leave: (opts: { userId: string; userName: string; message: string }) => void;
}

interface ClientToServerEvents {
  enter: (opts: {}) => void;
}

interface InterServerEvents {}

interface SocketData {
  userId: string;
  userName: string;
}

export {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
};
