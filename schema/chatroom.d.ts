import { IUserTag } from './auth';

interface IChatroomTag {
  roomName: string;
  maxUserCount: number;
  isTextOnly: boolean;
}

interface IChatroom extends IChatroomTag {
  hostUser: IUserTag;
  currentUserCount: number;
  roomId: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ICreateChatroom extends IChatroomTag {}

type IPatchChatroom = Partial<IChatroomTag>;

export { IChatroomTag, IChatroom, ICreateChatroom, IPatchChatroom };
