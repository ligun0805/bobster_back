import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '../../../roles/roles.enum';

@Entity('feeSchedule')
export class FeeScheduleEntity {
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 3, type: Number })
  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: RoleEnum,
  })
  userType: RoleEnum;

  @ApiProperty({ example: '3.5' })
  @Column('decimal', { precision: 5, scale: 2 })
  fee: number;

  @ApiProperty({ type: Date })
  @Column()
  fromDate: Date;
}
