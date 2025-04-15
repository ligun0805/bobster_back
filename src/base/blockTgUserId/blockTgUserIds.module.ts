// src/blockTgUserId/blockTgUserId.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockTgUserIdEntity } from './infrastructure/blockTgUserId.entity';
import { BlockTgUserIdRepository } from './infrastructure/blockTgUserId.repository';
import { BlockTgUserIdsService } from './blockTgUserIds.service';
import { BlockTgUserIdsController } from './blockTgUserIds.controller';
@Module({
  imports: [TypeOrmModule.forFeature([BlockTgUserIdEntity])],
  providers: [BlockTgUserIdRepository, BlockTgUserIdsService],
  controllers: [BlockTgUserIdsController],
  exports: [BlockTgUserIdsService],
})
export class BlockTgUserIdModule {}
