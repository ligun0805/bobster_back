import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { FileDto } from '../../files/dto/file.dto';
import { RoleDto } from '../../roles/dto/role.dto';
import { StatusDto } from '../../statuses/dto/status.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'John Doe', type: String })
  @IsOptional()
  userName?: string | null;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null;

  @ApiPropertyOptional({ type: () => RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null;

  @ApiPropertyOptional({ type: () => StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto;

  @ApiPropertyOptional({
    example: 'TLcr7Hzd8kHatNzhBArsR4qaq2dRTiPNtc',
    type: String,
  })
  @IsOptional()
  wallet?: string | null;
}
