import { IsString } from 'class-validator';
import {
  ChatroomEnterMessageC2S,
  ChatroomLeaveMessageC2S,
  ChatroomChatMessageC2S,
} from '@schema/ws/c2s';

export class ChatroomEnterDto implements ChatroomEnterMessageC2S {
  @IsString()
  roomId: string;
}

export class ChatroomLeaveDto implements ChatroomLeaveMessageC2S {
  @IsString()
  roomId: string;
}

export class ChatroomChatDto implements ChatroomChatMessageC2S {
  @IsString()
  username: string;

  @IsString()
  chatText: string;
}
