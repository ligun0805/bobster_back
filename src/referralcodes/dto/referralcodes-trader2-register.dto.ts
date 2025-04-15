import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ReferralCodesTraderRegisterLoginDto {
  @ApiProperty({ example: 'Ever9Runner', type: String })
  @IsNotEmpty()
  tgUserName: string;
}
