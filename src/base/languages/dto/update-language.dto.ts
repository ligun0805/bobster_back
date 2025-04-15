import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateLanguageDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  file_path: string;
}
