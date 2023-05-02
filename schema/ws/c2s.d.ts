export type ChatroomEnterMessage = { roomId: string };
export type ChatroomChatMessage = { chatText: string };
export type ChatroomLeaveMessage = { roomId: string };

interface IClientToServerEvents {
  enter: (opts: ChatroomEnterMessage) => void;
  chat: (opts: ChatroomChatMessage) => void;
  leave: (opts: ChatroomLeaveMessage) => void;
}

export { IClientToServerEvents };
