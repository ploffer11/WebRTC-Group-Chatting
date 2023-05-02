import { Server, Socket } from 'socket.io';
import {
  IClientToServerEvents,
  IInterServerEvents,
  IServerToClientEvents,
  ISocketData,
} from '@schema/ws';

type WebSocketServerType = Server<
  IClientToServerEvents,
  IServerToClientEvents,
  IInterServerEvents,
  ISocketData
>;

type WebSocketType = Socket<
  IClientToServerEvents,
  IServerToClientEvents,
  IInterServerEvents,
  ISocketData
>;

export { WebSocketServerType, WebSocketType };
