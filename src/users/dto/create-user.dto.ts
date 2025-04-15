import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { FileDto } from '../../files/dto/file.dto';
import { RoleDto } from '../../roles/dto/role.dto';
import { StatusDto } from '../../statuses/dto/status.dto';
import { ReferralCodeDto } from '../../referralcodes/dto/referralcodes.dto';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', type: String })
  @IsNotEmpty()
  userName: string | null;

  @ApiProperty({ example: '1234854', type: String })
  @IsNotEmpty()
  tgId: string;

  @ApiProperty({ example: '1234854', type: String })
  tgUserName: string;

  @ApiProperty({ type: ReferralCodeDto })
  @IsNotEmpty()
  referralCode: ReferralCodeDto;

  @ApiProperty({ example: '0', type: Number })
  @IsNotEmpty()
  referralAmount: number;

  tradeType: number;

  fee: number;

  currentBalance: number;

  processingBalance: number;

  @ApiPropertyOptional({
    example: 'TLcr7Hzd8kHatNzhBArsR4qaq2dRTiPNtc',
    type: String,
  })
  @IsOptional()
  wallet: string | null;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null;

  @ApiPropertyOptional({ type: RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null;

  @ApiPropertyOptional({ type: StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto;
}
