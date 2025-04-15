import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTxHashToPayment1742517546007 implements MigrationInterface {
  name = 'AddTxHashToPayment1742517546007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "tx_hash" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "UQ_beae01c9bd5cac339b02d73824a" UNIQUE ("tx_hash")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "tx_hash"`);
  }
}
