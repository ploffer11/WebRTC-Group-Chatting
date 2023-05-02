import { IUserTag } from '../auth';

export type ChatroomEnterMessage = { roomId: string; user: IUserTag };
export type ChatroomChatMessage = { chatText: string; user: IUserTag };
export type ChatroomLeaveMessage = { roomId: string; user: IUserTag };

interface IServerToClientEvents {
  enter: (opts: ChatroomEnterMessage) => void;
  chat: (opts: ChatroomChatMessage) => void;
  leave: (opts: ChatroomLeaveMessage) => void;
}

export { IServerToClientEvents };
