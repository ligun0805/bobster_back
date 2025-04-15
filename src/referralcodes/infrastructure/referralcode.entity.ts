import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { EntityRelationalHelper } from '../../utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'referralCode',
})
export class ReferralCodeEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    type: Number,
    example: '23',
  })
  @Column()
  refererId: number;

  @ApiProperty({
    type: Number,
    example: '3',
  })
  @Column()
  roleId: number;
}
