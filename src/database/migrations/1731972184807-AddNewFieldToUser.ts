import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNewFieldToUser1731972184807 implements MigrationInterface {
  name = 'AddNewFieldToUser1731972184807';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'wallet',
        type: 'varchar',
        isNullable: true, // Set to false if you want this field to be required
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
