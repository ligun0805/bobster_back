import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserVerificationTable1741830970441
  implements MigrationInterface
{
  name = 'AddUserVerificationTable1741830970441';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_verifications_documenttype_enum" AS ENUM('ID', 'PASSPORT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_verifications" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "middleName" character varying, "documentType" "public"."user_verifications_documenttype_enum" NOT NULL, "documentId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_b5aadfc04db5b23d06c0447e0f" UNIQUE ("userId"), CONSTRAINT "PK_3269a92433d028916ab342b94fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_verifications" ADD CONSTRAINT "FK_b5aadfc04db5b23d06c0447e0f4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_verifications" DROP CONSTRAINT "FK_b5aadfc04db5b23d06c0447e0f4"`,
    );
    await queryRunner.query(`DROP TABLE "user_verifications"`);
    await queryRunner.query(
      `DROP TYPE "public"."user_verifications_documenttype_enum"`,
    );
  }
}
