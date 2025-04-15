import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';
import { BlockTgUserIdsService } from './blockTgUserIds.service';

@ApiTags('BlockTgUserId')
@Controller({
  path: 'blockTgUserIds',
  version: '1',
})
export class BlockTgUserIdsController {
  constructor(private readonly service: BlockTgUserIdsService) {}
}
