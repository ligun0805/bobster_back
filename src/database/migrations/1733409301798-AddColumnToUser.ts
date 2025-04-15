import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnToUser1733409301798 implements MigrationInterface {
  name = 'AddColumnToUser1733409301798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'tgUserName',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
