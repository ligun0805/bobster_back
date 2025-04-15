// src/blockTgUserId/infrastructure/blockTgUserId.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'blockTgUserId',
})
export class BlockTgUserIdEntity {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
  })
  @Column()
  tgId: string;

  @ApiProperty({
    type: Number,
  })
  @Column({ default: 0 })
  failAttempts: number;
}
