import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDepositDto {
  @ApiProperty({ example: 3, type: Number })
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @ApiProperty({ example: 1000, type: Number })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'UQCzuzLej_2UxWpJ5jLYq9zBrVjuzizKk9fIrfIJLMd2e_79',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  user_wallet: string;

  @ApiProperty({
    example: 'UQCzuzLej_2UxWpJ5jLYq9zBrVjuzizKk9fIrfIJLMd2e_79',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  admin_wallet: string;

  @ApiProperty({
    example: 'KKsC0o8idOn4GBdG9UmaULaV+XUm+KPNhlvqTTf7QdA=',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  tx_hash: string;
}

export class CreateWithdrawDto {
  @ApiProperty({ example: 3, type: Number })
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @ApiProperty({ example: 1000, type: Number })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'UQCzuzLej_2UxWpJ5jLYq9zBrVjuzizKk9fIrfIJLMd2e_79',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  user_wallet: string;
}
