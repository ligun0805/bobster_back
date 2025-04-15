import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnToCurrencyPair1734708664406
  implements MigrationInterface
{
  name = 'AddColumnToCurrencyPair1734708664406';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'currency_pairs',
      new TableColumn({
        name: 'profit',
        type: 'integer',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
