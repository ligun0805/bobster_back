import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

// <database-block>
const idType = Number;
// </database-block>

export class Role {
  @Allow()
  @ApiProperty({
    type: idType,
  })
  id: number;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'admin',
  })
  name?: string;
}
