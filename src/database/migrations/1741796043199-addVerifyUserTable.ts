import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerifyUserTable1741796043199 implements MigrationInterface {
  name = 'AddVerifyUserTable1741796043199';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."addresses_userrole_enum" AS ENUM('0', '1', '2', '3', '4', '5')`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "userRole" "public"."addresses_userrole_enum" NOT NULL DEFAULT '5'`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`,
    );
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "userRole"`);
    await queryRunner.query(`DROP TYPE "public"."addresses_userrole_enum"`);
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
