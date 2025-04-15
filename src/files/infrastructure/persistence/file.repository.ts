import { NullableType } from '../../../utils/types/nullable.type';
import { FileType } from '../../domain/file';

export abstract class FileRepository {
  abstract create(
    user_id: number,
    data: Omit<FileType, 'id'>,
    userName: string,
  ): Promise<FileType>;

  abstract findById(id: FileType['id']): Promise<NullableType<FileType>>;
}
