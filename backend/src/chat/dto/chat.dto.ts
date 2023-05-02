import { IsString } from 'class-validator';
import {
  ChatroomEnterMessage,
  ChatroomLeaveMessage,
  ChatroomChatMessage,
} from '@schema/ws/c2s';

export class ChatroomEnterDto implements ChatroomEnterMessage {
  @IsString()
  roomId: string;
}

export class ChatroomLeaveDto implements ChatroomLeaveMessage {
  @IsString()
  roomId: string;
}

export class ChatroomChatDto implements ChatroomChatMessage {
  @IsString()
  username: string;

  @IsString()
  chatText: string;
}
