// src/blockTgUserId/blockTgUserId.service.ts
import { Injectable } from '@nestjs/common';
import { BlockTgUserIdRepository } from './infrastructure/blockTgUserId.repository';
import { BlockTgUserIdEntity } from './infrastructure/blockTgUserId.entity';
import { BOT_MESSAGES } from '../../telegram/telegram.messages';

@Injectable()
export class BlockTgUserIdsService {
  constructor(private readonly repository: BlockTgUserIdRepository) {}

  async getAttemptByTgId(tgId: string): Promise<number> {
    const blockTgUser = await this.repository.findByTgId(tgId);
    if (blockTgUser) return blockTgUser.failAttempts;
    else return -1;
  }

  async handleLoginAttempt(tgId: string, success: boolean): Promise<string> {
    let entity = await this.repository.findByTgId(tgId);

    if (success) {
      if (entity) {
        await this.repository.deleteById(entity.id);
      }
      return 'removed from blockList';
    } else {
      if (!entity) {
        entity = new BlockTgUserIdEntity();
        entity.tgId = tgId;
        entity.failAttempts = 1;
        console.log(entity.failAttempts, entity.failAttempts);
        await this.repository.save(entity);
      } else {
        entity.failAttempts += 1;
        await this.repository.update(entity);
      }

      if (entity.failAttempts >= 5) {
        return BOT_MESSAGES.USER_ACCOUNT_BLOCKED;
      } else {
        return BOT_MESSAGES.USER_NOT_ACCEPTED;
      }
    }
  }
}
