import { IUserTag } from '../auth';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IWebsocketUser extends IUserTag {
  socketId: string;
}
export interface ISocketData {
  user: IWebsocketUser;
}

export * from './s2c';
export * from './c2s';
export * from './s2s';
