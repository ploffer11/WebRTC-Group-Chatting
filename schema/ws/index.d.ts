import { IUserTag } from '../auth';

export interface IWebsocketUser extends IUserTag {}
export interface ISocketData {
  user: IWebsocketUser;
}

export * from './s2c';
export * from './c2s';
export * from './s2s';
