import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeTxHashNullable1742562584151 implements MigrationInterface {
    name = 'MakeTxHashNullable1742562584151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "tx_hash" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "tx_hash" SET NOT NULL`);
    }

}
