import { IUserTag } from '../auth';

interface ISocketData {
  user: IUserTag;
}

export { ISocketData };

export * from './s2c';
export * from './c2s';
export * from './s2s';
