import { IWebsocketUser } from '.';

export type ChatroomChatMessageS2C = { chatText: string; user: IWebsocketUser };
export type ChatroomUsersMessageS2C = { users: IWebsocketUser[] };

export type RTCOfferMessageS2C = { fromSocketId: string; offer: unknown };
export type RTCAnswerMessageS2C = { fromSocketId: string; answer: unknown };
export type RTCICECandidateMesageS2C = {
  fromSocketId: string;
  candidate: unknown;
};

export interface IServerToClientEvents {
  chat: (opts: ChatroomChatMessageS2C) => void;

  users: (opts: ChatroomUsersMessageS2C) => void;

  offer: (opts: RTCOfferMessageS2C) => void;
  answer: (opts: RTCAnswerMessageS2C) => void;

  candidate: (opts: RTCICECandidateMesageS2C) => void;
}
