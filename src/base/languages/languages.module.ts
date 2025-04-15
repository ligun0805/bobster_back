import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageController } from './languages.controller';
import { LanguagesService } from './languages.service';
import { LanguageEntity } from './infrastructure/language.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LanguageEntity])],
  controllers: [LanguageController],
  providers: [LanguagesService],
})
export class LanguagesModule {}
