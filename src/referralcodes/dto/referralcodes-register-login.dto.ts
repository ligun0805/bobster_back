import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ReferralCodeDto } from '../../referralcodes/dto/referralcodes.dto';
import { RoleDto } from '../../roles/dto/role.dto';
export class ReferralCodesRegisterLoginDto {
  @ApiProperty({ example: 'John Doe' })
  userName: string;

  @ApiProperty({ example: '12345678', type: String })
  @IsNotEmpty()
  tgId: string;

  @ApiProperty({ example: 'Ever9Runner', type: String })
  @IsNotEmpty()
  tgUserName: string;

  fee: number;

  @ApiProperty({ example: '0', type: Number })
  @IsNotEmpty()
  referralAmount: number;

  @ApiProperty({
    example: '278a4156-bc82-4e5f-ba52-c62450261e73',
    type: ReferralCodeDto,
  })
  referralCode: ReferralCodeDto;

  @ApiProperty({ example: '2', type: RoleDto })
  role: RoleDto;
}
