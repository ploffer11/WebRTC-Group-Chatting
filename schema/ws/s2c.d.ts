import { IWebsocketUser } from '.';

export type ChatroomEnterMessage = { roomId: string; user: IWebsocketUser };
export type ChatroomChatMessage = { chatText: string; user: IWebsocketUser };
export type ChatroomLeaveMessage = { roomId: string; user: IWebsocketUser };

interface IServerToClientEvents {
  enter: (opts: ChatroomEnterMessage) => void;
  chat: (opts: ChatroomChatMessage) => void;
  leave: (opts: ChatroomLeaveMessage) => void;
}

export { IServerToClientEvents };
