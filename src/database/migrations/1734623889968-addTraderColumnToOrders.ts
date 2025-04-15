import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTraderColumnToOrder1734623889968 implements MigrationInterface {
  name = 'AddTraderColumnToOrder1734623889968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'traderPaymentMethodId',
        type: 'integer',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
