import { IWebsocketUser } from '.';

export type ChatroomEnterMessageS2C = { roomId: string; user: IWebsocketUser };
export type ChatroomChatMessageS2C = { chatText: string; user: IWebsocketUser };
export type ChatroomLeaveMessageS2C = { roomId: string; user: IWebsocketUser };

interface IServerToClientEvents {
  enter: (opts: ChatroomEnterMessageS2C) => void;
  chat: (opts: ChatroomChatMessageS2C) => void;
  leave: (opts: ChatroomLeaveMessageS2C) => void;
}

export { IServerToClientEvents };
