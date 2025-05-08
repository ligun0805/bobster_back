import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Response,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { LanguageEntity } from './infrastructure/language.entity';
import { Express } from 'express';

@ApiTags('Language')
@Controller({
  path: 'languages',
  version: '1',
})
export class LanguageController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Post()
  async createLanguage(
    @Body() createLanguageDto: CreateLanguageDto,
  ): Promise<LanguageEntity> {
    return this.languagesService.createLanguage(createLanguageDto);
  }

  @Get()
  async getAllLanguages(): Promise<LanguageEntity[]> {
    return this.languagesService.getAllLanguages();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('uploadJSON')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './files',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(json)$/)) {
          return cb(
            new HttpException('Invalid file type', HttpStatus.BAD_REQUEST),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      file: file.filename,
    };
  }

  @Get('getFile/:path')
  @ApiExcludeEndpoint()
  download(@Param('path') path, @Response() response) {
    return response.sendFile(path, { root: './files' });
  }

  @Get(':id')
  async getLanguageById(@Param('id') id: number): Promise<LanguageEntity> {
    return this.languagesService.getLanguageById(id);
  }

  @Put(':id')
  async updateLanguage(
    @Param('id') id: number,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ): Promise<LanguageEntity> {
    return this.languagesService.updateLanguage(id, updateLanguageDto);
  }

  @Delete(':id')
  async deleteLanguage(@Param('id') id: number): Promise<void> {
    return this.languagesService.deleteLanguage(id);
  }
}
