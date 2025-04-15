import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateLanguageDto {
  @ApiProperty({ example: 'en', type: String })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'English', type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'file-1732195161717-911918959.json', type: String })
  @IsString()
  @IsNotEmpty()
  file_path: string;
}
