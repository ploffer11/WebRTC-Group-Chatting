import { IWebsocketUser } from '.';

export type ChatroomEnterMessageS2C = { roomId: string; user: IWebsocketUser };
export type ChatroomChatMessageS2C = { chatText: string; user: IWebsocketUser };
export type ChatroomLeaveMessageS2C = { roomId: string; user: IWebsocketUser };
export type ChatroomUsersMessageS2C = { users: string[] };

export type RTCOfferMessageS2C = { fromUsername: string; offer: unknown };
export type RTCAnswerMessageS2C = { fromUsername: string; answer: unknown };
export type RTCICECandidateMesageS2C = {
  fromUsername: string;
  candidate: unknown;
};

export interface IServerToClientEvents {
  enter: (opts: ChatroomEnterMessageS2C) => void;
  chat: (opts: ChatroomChatMessageS2C) => void;
  leave: (opts: ChatroomLeaveMessageS2C) => void;

  users: (opts: ChatroomUsersMessageS2C) => void;

  offer: (opts: RTCOfferMessageS2C) => void;
  answer: (opts: RTCAnswerMessageS2C) => void;

  candidate: (opts: RTCICECandidateMesageS2C) => void;
}
