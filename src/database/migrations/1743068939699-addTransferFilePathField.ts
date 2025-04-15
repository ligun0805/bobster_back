import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransferFilePathField1743068939699 implements MigrationInterface {
    name = 'AddTransferFilePathField1743068939699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "transferFilePath" character varying`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "tx_hash" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "tx_hash" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "transferFilePath"`);
    }

}
