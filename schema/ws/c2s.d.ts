export type ChatroomEnterMessageC2S = { roomId: string };
export type ChatroomChatMessageC2S = { chatText: string };
export type ChatroomLeaveMessageC2S = { roomId: string };

export interface IClientToServerEvents {
  enter: (opts: ChatroomEnterMessageC2S) => void;
  chat: (opts: ChatroomChatMessageC2S) => void;
  leave: (opts: ChatroomLeaveMessageC2S) => void;
}
