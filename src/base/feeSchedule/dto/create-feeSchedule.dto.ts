import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { RoleEnum } from '../../../roles/roles.enum';

export class CreateFeeScheduleDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: RoleEnum.trader, enum: RoleEnum })
  @IsNotEmpty()
  @IsEnum(RoleEnum)
  userType: RoleEnum;

  @ApiProperty({ example: 3.5, type: Number })
  @IsNotEmpty()
  @IsNumber()
  fee: number;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', type: Date, required: false })
  @IsOptional()
  fromDate?: Date;
}
