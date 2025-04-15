enum DocumentType {
  ID = 'ID',
  PP = 'PP',
  DL = 'DL',
}

import { IsEnum, IsNotEmpty } from 'class-validator';

export class UploadDocDto {
  @IsNotEmpty()
  userName: string;

  @IsEnum(DocumentType)
  @IsNotEmpty({ message: 'Document type is required' })
  documentType: DocumentType;
}
