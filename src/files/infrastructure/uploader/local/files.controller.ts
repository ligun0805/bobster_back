import {
  Request,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesLocalService } from './files.service';
import { FileResponseDto } from './dto/file-response.dto';
import { UploadDocDto } from './dto/upload-doc.dto';

@ApiTags('Upload Document')
@Controller({
  path: 'document',
  version: '1',
})
export class FilesLocalController {
  constructor(private readonly filesService: FilesLocalService) {}

  @ApiCreatedResponse({
    type: FileResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userName: {
          type: 'string',
        },
        documentType: {
          type: 'string',
          enum: ['ID', 'DL', 'PP'],
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() request,
    @Body() body: UploadDocDto,
  ): Promise<FileResponseDto> {
    return this.filesService.create(request.user.id, file, body);
  }

  @Get(':path')
  @ApiExcludeEndpoint()
  download(@Param('path') path, @Response() response) {
    return response.sendFile(path, { root: './files' });
  }
}
