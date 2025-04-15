import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from '../entities/file.entity';
import { Repository } from 'typeorm';
import { FileRepository } from '../../file.repository';

import { FileMapper } from '../mappers/file.mapper';
import { FileType } from '../../../../domain/file';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { UsersService } from '../../../../../users/users.service';

@Injectable()
export class FileRelationalRepository implements FileRepository {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    user_id: number,
    data: FileType,
    userName: string,
  ): Promise<FileType> {
    await this.usersService.setUserName(user_id, userName);
    const userEntity = await this.usersService.findById_Entity(user_id);

    const persistenceModel = FileMapper.toPersistence(data);
    if (userEntity) persistenceModel.user = userEntity;

    return await this.fileRepository.save(
      this.fileRepository.create(persistenceModel),
    );
  }

  async findById(id: FileType['id']): Promise<NullableType<FileType>> {
    const entity = await this.fileRepository.findOne({
      where: {
        id: id,
      },
    });

    return entity ? FileMapper.toDomain(entity) : null;
  }
}
