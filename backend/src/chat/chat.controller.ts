import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { IUserTag } from '@schema/auth';
import { IChatroom } from '@schema/chatroom';

import { ChatService } from './chat.service';
import { CreateChatroomReqDto, PatchChatroomReqDto } from './dto/chat.dto';
import { User } from '../auth/auth.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  createChatroom(
    @Body() createChatroomDto: CreateChatroomReqDto,
    @User() user: IUserTag,
  ): IChatroom {
    return this.chatService.createChatroom(createChatroomDto, user).serialize();
  }

  @Get()
  findAllChatrooms(): IChatroom[] {
    return this.chatService
      .findAllChatrooms()
      .map((chatroom) => chatroom.serialize());
  }

  @Get(':roomId')
  findChatroom(@Param('roomId') roomId: string): IChatroom {
    return this.chatService.findChatroom(roomId).serialize();
  }

  @Patch(':roomId')
  patchChatroom(
    @Param('roomId') roomId: string,
    @User() user: IUserTag,
    @Body() patchChatroomReqDto: PatchChatroomReqDto,
  ): IChatroom {
    return this.chatService
      .patchChatroom(roomId, user, patchChatroomReqDto)
      .serialize();
  }

  @Delete(':roomId')
  deleteChatroom(
    @Param('roomId') roomId: string,
    @User() user: IUserTag,
  ): boolean {
    return this.chatService.deleteChatroom(roomId, user);
  }
}
