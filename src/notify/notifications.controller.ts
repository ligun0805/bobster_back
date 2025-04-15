import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationEntity } from './infrastructure/notification.entity';
import { AuthGuard } from '@nestjs/passport';
import { QueryNotificationDto } from './dto/query-notification.dto';

@ApiTags('Notifications')
@Controller({
  path: 'notifications',
  version: '1',
})
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Request() request, @Query() query: QueryNotificationDto) {
    const userId = request.user.id;
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }
    return this.notificationsService.findManyWithPagination({
      userId,
      paginationOptions: {
        page,
        limit,
        keyword: '',
      },
    });
  }
}
