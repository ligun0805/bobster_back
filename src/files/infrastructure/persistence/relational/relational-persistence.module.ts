import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { FileRepository } from '../file.repository';
import { FileRelationalRepository } from './repositories/file.repository';
import { UsersModule } from '../../../../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), UsersModule],
  providers: [
    {
      provide: FileRepository,
      useClass: FileRelationalRepository,
    },
  ],
  exports: [FileRepository],
})
export class RelationalFilePersistenceModule {}
