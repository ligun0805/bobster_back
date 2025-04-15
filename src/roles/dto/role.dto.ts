import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Role } from '../domain/role';

export class RoleDto implements Role {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
