export type ChatroomEnterMessageC2S = { roomId: string };
export type ChatroomChatMessageC2S = { chatText: string };
export type ChatroomLeaveMessageC2S = { roomId: string };

export type RTCOfferMessageC2S = { toUsername: string; offer: unknown };
export type RTCAnswerMessageC2S = { toUsername: string; answer: unknown };
export type RTCICECandidateMesageC2S = {
  toUsername: string;
  candidate: unknown;
};

export interface IClientToServerEvents {
  enter: (opts: ChatroomEnterMessageC2S) => void;
  chat: (opts: ChatroomChatMessageC2S) => void;
  leave: (opts: ChatroomLeaveMessageC2S) => void;

  offer: (opts: RTCOfferMessageC2S) => void;
  answer: (opts: RTCAnswerMessageC2S) => void;

  candidate: (opts: RTCICECandidateMesageC2S) => void;
}
