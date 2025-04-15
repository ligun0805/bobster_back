import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class Language {
  @Allow()
  @ApiProperty({
    type: Number,
    example: 1,
  })
  id: number;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'en',
  })
  code: string;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'English',
  })
  name: string;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'file-1732195161717-911918959.json',
  })
  file_path: string;
}
