import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNewFieldInLanguage1732204470006 implements MigrationInterface {
  name = 'AddNewFieldInLanguage1732204470006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'languages',
      new TableColumn({
        name: 'file_path',
        type: 'varchar',
        isNullable: true, // Set to false if you want this field to be required
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
