import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNewColumnToOrder1734623889968 implements MigrationInterface {
  name = 'AddNewColumnToOrder1734623889968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'usdtAmount',
        type: 'integer',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
