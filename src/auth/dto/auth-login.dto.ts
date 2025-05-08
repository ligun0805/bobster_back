import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AuthLoginDto {
  // @ApiProperty({ example: 'Ever9Runner', type: String })
  // @IsNotEmpty()
  // tgId: string;

 @ApiPropertyOptional({ description: 'Telegram numeric ID' })
 @IsString()
 @IsOptional()
 tgId?: string;

 @ApiPropertyOptional({ description: 'Telegram @username' })
 @IsString()
 @IsOptional()
 tgUserName?: string;
 }
