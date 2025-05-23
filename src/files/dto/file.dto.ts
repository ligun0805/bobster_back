import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FileDto {
  @ApiProperty()
  @IsString()
  id: string;
  type: string;
  path: string;
}
