import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FileRepository } from '../../persistence/file.repository';
import { AllConfigType } from '../../../../config/config.type';
import { FileType } from '../../../domain/file';
import { UploadDocDto } from './dto/upload-doc.dto';

@Injectable()
export class FilesLocalService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly fileRepository: FileRepository,
  ) {}

  async create(
    user_id: number,
    file: Express.Multer.File,
    uploadDocDto: UploadDocDto,
  ): Promise<{ file: FileType }> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'selectFile',
        },
      });
    }
    if (!(uploadDocDto.documentType && uploadDocDto.userName)) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'input username and select document type',
        },
      });
    }
    const responseFile = await this.fileRepository.create(
      user_id,
      {
        type: uploadDocDto.documentType,
        path: `${file.filename}`,
      },
      uploadDocDto.userName,
    );
    console.log('hereeeeeeeeeee', responseFile);
    return {
      file: responseFile,
    };
  }
}
