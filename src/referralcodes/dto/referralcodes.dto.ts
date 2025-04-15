import { ApiProperty } from '@nestjs/swagger';
import { ReferralCode } from '../domain/referralcode';
import { IsNumber } from 'class-validator';

export class ReferralCodeDto implements ReferralCode {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsNumber()
  refererId: number;

  @ApiProperty()
  @IsNumber()
  roleId: number;
}
