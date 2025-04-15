// src/language/language.service.ts
import {
  Injectable,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LanguageEntity } from './infrastructure/language.entity';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(LanguageEntity)
    private readonly languageRepository: Repository<LanguageEntity>,
  ) {}

  async createLanguage(
    createLanguageDto: CreateLanguageDto,
  ): Promise<LanguageEntity> {
    const language = this.languageRepository.create(createLanguageDto);
    return this.languageRepository.save(language);
  }

  async getAllLanguages(): Promise<LanguageEntity[]> {
    return this.languageRepository.find();
  }

  async getLanguageById(id: number): Promise<LanguageEntity> {
    const language = await this.languageRepository.findOne({
      where: { id: id },
    });
    if (!language) {
      throw new UnprocessableEntityException({
        status: HttpStatus.NOT_ACCEPTABLE,
        errors: {
          status: 'language does not exist',
        },
      });
    }
    return language;
  }

  async updateLanguage(
    id: number,
    updateLanguageDto: UpdateLanguageDto,
  ): Promise<LanguageEntity> {
    const language = await this.getLanguageById(id);
    Object.assign(language, updateLanguageDto);
    return this.languageRepository.save(language);
  }

  async deleteLanguage(id: number): Promise<void> {
    const language = await this.getLanguageById(id);
    await this.languageRepository.remove(language);
  }
}
