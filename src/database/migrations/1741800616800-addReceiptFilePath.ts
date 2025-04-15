import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReceiptFilePath1741800616800 implements MigrationInterface {
  name = 'AddReceiptFilePath1741800616800';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "receiptFilePath" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isVerified" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isVerified"`);
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "receiptFilePath"`,
    );
  }
}
