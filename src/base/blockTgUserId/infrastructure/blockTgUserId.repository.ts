// src/blockTgUserId/infrastructure/blockTgUserId.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockTgUserIdEntity } from './blockTgUserId.entity';

@Injectable()
export class BlockTgUserIdRepository {
  constructor(
    @InjectRepository(BlockTgUserIdEntity)
    private readonly repository: Repository<BlockTgUserIdEntity>,
  ) {}

  async findByTgId(tgId: string): Promise<BlockTgUserIdEntity | null> {
    return await this.repository.findOne({ where: { tgId: tgId } });
  }

  async save(entity: BlockTgUserIdEntity): Promise<BlockTgUserIdEntity> {
    return await this.repository.save(entity);
  }

  async update(entity: BlockTgUserIdEntity): Promise<void> {
    await this.repository.update(
      { id: entity.id },
      { failAttempts: entity.failAttempts },
    );
  }

  async deleteById(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
