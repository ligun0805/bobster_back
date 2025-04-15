import {
  Controller,
  Post,
  Body,
  Query,
  Request,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateSupportChatMessageDto } from './dto/create-support-chat.dto';
import { QueryChatDto } from './dto/query-chat.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('ChatMessage')
@Controller({
  path: 'chats',
  version: '1',
})
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class ChatsController {
  constructor(private readonly chatService: ChatsService) {}

  @Post('send')
  async sendMessage(@Body() createChatMessageDto: CreateChatMessageDto) {
    console.log('Sending message:', createChatMessageDto);
    const result = await this.chatService.sendMessage(createChatMessageDto);
    console.log('Message sent result:', result);
    return result;
  }

  @Post('sendToSupport')
  async sendMessageToSupport(
    @Body() CreateSupportChatMessageDto: CreateSupportChatMessageDto,
  ) {
    return this.chatService.sendMessageToSupport(CreateSupportChatMessageDto);
  }

  @Post('read/:chatId')
  async readMessage(@Param('chatId') chatId: number) {
    return this.chatService.readMessage(chatId);
  }

  @Post('finish/chat/:orderId')
  async finishChat(@Param('orderId') orderId: string) {
    return this.chatService.finishChat(orderId);
  }

  @Post('finish/ticket/:ticketId')
  async finishTicket(@Param('ticketId') ticketId: string) {
    return this.chatService.finishTicket(ticketId);
  }

  @Get('')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async findAllForUser(@Request() request, @Query() query: QueryChatDto) {
    console.log('hereeeeeeeeeeeeeee', request.user);
    const userId = request.user.id;
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const keyword = query?.keyword ?? '';
    const isFinished = query?.isFinished ?? false;
    const isChat = query?.isChat ?? true;
    console.log(isChat);
    return this.chatService.findManyWithPagination({
      userId,
      isFinished,
      isChat,
      paginationOptions: {
        page,
        limit,
        keyword,
      },
    });
  }

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query() query: QueryChatDto) {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const keyword = query?.keyword ?? '';
    // const isFinished = query?.isFinished ?? false;
    const isChat = query?.isChat ?? true;
    console.log(isChat);
    return this.chatService.findAllChatListManyWithPagination({
      paginationOptions: {
        page,
        limit,
        keyword,
      },
    });
  }

  @Get('byOrderOrTicket/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async findByOrder(
    @Request() request,
    @Query() query: QueryChatDto,
    @Param('id') id: string,
  ) {
    const userId = request.user.id;

    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const keyword = query?.keyword ?? '';
    const isChat = query?.isChat ?? true;
    return this.chatService.findById({
      userId,
      id,
      isChat,
      paginationOptions: {
        page,
        limit,
        keyword,
      },
    });
  }

  @Get('chatLists')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async findChatList(@Request() request, @Query() query: QueryChatDto) {
    const roleId = request.user.role.id;
    const userId = request.user.id;
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const keyword = query?.keyword ?? '';
    const isFinished = query?.isFinished ?? false;
    return this.chatService.findAllChatsManyWithPagination({
      roleId,
      userId,
      isFinished,
      paginationOptions: {
        page,
        limit,
        keyword,
      },
    });
  }

  @Get('orderChatLists')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async findOrderChatList(@Request() request, @Query() query: QueryChatDto) {
    const roleId = request.user.role.id;
    const userId = request.user.id;
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const keyword = query?.keyword ?? '';
    const isFinished = query?.isFinished ?? false;
    return this.chatService.findOrderManyWithPagination({
      roleId,
      userId,
      isFinished,
      paginationOptions: {
        page,
        limit,
        keyword,
      },
    });
  }

  @Get('supportChatLists')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async findSupportChatList(@Request() request, @Query() query: QueryChatDto) {
    const roleId = request.user.role.id;
    const userId = request.user.id;
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    const keyword = query?.keyword ?? '';
    const isFinished = query?.isFinished ?? false;
    return this.chatService.findSupportManyWithPagination({
      roleId,
      userId,
      isFinished,
      paginationOptions: {
        page,
        limit,
        keyword,
      },
    });
  }

  @Get('getChat/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async findChatById(@Param('id') id: string) {
    return this.chatService.findChatById({
      id,
    });
  }
}
