import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayment1732669037268 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "payment" (
        "id" SERIAL PRIMARY KEY, 
        "user_id" integer NOT NULL, 
        "amount" integer NOT NULL,
        "user_wallet" character varying NOT NULL,
        "admin_wallet" character varying,
        "status" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payment"`);
  }
}
