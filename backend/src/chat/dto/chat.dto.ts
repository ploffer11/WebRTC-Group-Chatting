import { IsBoolean, IsInt, IsString, Max, Min } from 'class-validator';

import { ICreateChatroom, IPatchChatroom } from '@schema/chatroom';
import {
  ChatroomEnterMessageC2S,
  ChatroomLeaveMessageC2S,
  ChatroomChatMessageC2S,
  RTCOfferMessageC2S,
  RTCAnswerMessageC2S,
  RTCICECandidateMesageC2S,
} from '@schema/ws/c2s';

export class ChatroomEnterDto implements ChatroomEnterMessageC2S {
  @IsString()
  roomId!: string;
}

export class ChatroomLeaveDto implements ChatroomLeaveMessageC2S {
  @IsString()
  roomId!: string;
}

export class ChatroomChatDto implements ChatroomChatMessageC2S {
  @IsString()
  chatText!: string;
}

export class ChatroomRTCOfferDto implements RTCOfferMessageC2S {
  @IsString()
  toSocketId!: string;

  offer!: unknown;
}

export class ChatroomRTCAnswerDto implements RTCAnswerMessageC2S {
  @IsString()
  toSocketId!: string;

  answer!: unknown;
}

export class ChatroomRTCICECandidateDto implements RTCICECandidateMesageC2S {
  @IsString()
  toSocketId!: string;

  candidate!: unknown;
}

export class CreateChatroomReqDto implements ICreateChatroom {
  @IsString()
  roomName!: string;

  @IsInt()
  @Min(2)
  @Max(6)
  maxUserCount!: number;

  @IsBoolean()
  isTextOnly!: boolean;
}

export class PatchChatroomReqDto implements IPatchChatroom {
  @IsString()
  roomName?: string;

  @IsInt()
  @Min(2)
  @Max(6)
  maxUserCount?: number;

  @IsBoolean()
  isTextOnly?: boolean;
}
