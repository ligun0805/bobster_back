import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1715028537217 implements MigrationInterface {
  name = 'CreateUser1715028537217';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "role" ("id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "status" ("id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_e12743a7086ec826733f54e1d95" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "referralCode" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "refererId" integer NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_e12743a7086ec826733f84e1d95" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "path" character varying NOT NULL, "type" character varying NOT NULL, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "currency" ("id" SERIAL NOT NULL, "code" character varying NOT NULL UNIQUE, "name" character varying NOT NULL, "symbol" character varying NOT NULL, "limit" decimal(16,0), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e14743a7086ec826733f54e1d95" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "currency_pairs" (
        "id" SERIAL NOT NULL, 
        "baseCurrencyId" integer NOT NULL, 
        "targetCurrencyId" integer NOT NULL, 
        "exchangeRate" decimal(18,8) NOT NULL, 
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
        CONSTRAINT "PK_currency_pairs_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "payment_method" (
        "id" SERIAL NOT NULL, 
        "type" character varying NOT NULL, 
        "details" json NOT NULL, 
        "userId" integer NOT NULL,
        CONSTRAINT "PK_payment_method_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "feeSchedule" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "userType" integer NOT NULL, 
        "fee" decimal(5,2) NOT NULL,
        "fromDate" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_feeSchedule_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "user" (
        "id" SERIAL NOT NULL, 
        "userName" character varying, 
        "tgId" character varying, 
        "referralCodeId" uuid, 
        "referralAmount" integer, 
        "photoId" uuid, 
        "roleId" integer, 
        "tradeType" integer,
        "fee" decimal(5,2),
        "myCurrencyId" integer,
        "receiverCurrencyId" integer,
        "languageId" integer,
        "currentBalance" decimal(18,2),
        "processingBalance" decimal(18,2),
        "statusId" integer, 
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
        "deletedAt" TIMESTAMP, 
        CONSTRAINT "REL_75e2be4ce11d447ef43be0e374" UNIQUE ("photoId"),
        CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "orders" (
        "id" SERIAL NOT NULL,
        "orderId" character varying,
        "customerCurrencyId" integer,
        "receiverCurrencyId" integer,
        "customerId" integer,
        "trader1Id" integer,
        "trader2Id" integer,
        "amount" integer NOT NULL,
        "paymentMethodId" integer,
        "status" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "traderDepositedAt" TIMESTAMP,
        "customerSentAt" TIMESTAMP,
        "traderReceivedAt" TIMESTAMP,
        "traderPaidAt" TIMESTAMP,
        "trader2ParticipatedAt" TIMESTAMP,
        "customerConfirmedAt" TIMESTAMP,
        "canceledAt" TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "orderType" integer NOT NULL,
        "traderFee" decimal(5,2),
        "refererFee" decimal(5,2),
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_customer" FOREIGN KEY ("customerId") REFERENCES "user"("id"),
        CONSTRAINT "FK_trader1" FOREIGN KEY ("trader1Id") REFERENCES "user"("id"),
        CONSTRAINT "FK_trader2" FOREIGN KEY ("trader2Id") REFERENCES "user"("id"),
        CONSTRAINT "FK_paymentMethod" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_method"("id")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "reviews" (
        "id" SERIAL NOT NULL,
        "orderId" integer,
        "traderId" integer,
        "customerId" integer,
        "type" character varying NOT NULL,
        "score" integer NOT NULL,
        "content" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reviews_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id"),
        CONSTRAINT "FK_trader" FOREIGN KEY ("traderId") REFERENCES "user"("id"),
        CONSTRAINT "FK_customer" FOREIGN KEY ("customerId") REFERENCES "user"("id")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "languages" (
        "id" SERIAL NOT NULL, 
        "code" character varying NOT NULL, 
        "name" character varying NOT NULL, 
        CONSTRAINT "PK_languages_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "blockTgUserId" (
        "id" SERIAL NOT NULL,
        "tgId" character varying NOT NULL,
        "failAttempts" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_blockTgUserId_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "addresses" (
        "id" SERIAL NOT NULL,
        "country" character varying,
        "city" character varying,
        "street" character varying,
        "fullAddress" character varying,
        "userId" integer,
        CONSTRAINT "PK_addresses_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id" SERIAL PRIMARY KEY,
        "senderId" integer NOT NULL,
        "receiverId" integer NOT NULL,
        "orderId" character varying,
        "ticketId" character varying,
        "message" character varying,
        "read" BOOLEAN,
        "isFinished" BOOLEAN,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications" (
        "id" SERIAL PRIMARY KEY,
        "receiverId" integer NOT NULL,
        "title" character varying NOT NULL,
        "content" character varying NOT NULL,
        "read" boolean,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_58e4dbff0e1a32a9bdc861bb29" ON "user" ("userName") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "session" ("id" SERIAL NOT NULL, "hash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3d2f174ef04fb312fdebd0ddc5" ON "session" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_75e2be4ce11d447ef43be0e374f" FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_dc18daa696860586ba4667a9d31" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "currency_pairs" 
       ADD CONSTRAINT "FK_base_currency" 
       FOREIGN KEY ("baseCurrencyId") 
       REFERENCES "currency"("id") 
       ON DELETE NO ACTION 
       ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "currency_pairs" 
       ADD CONSTRAINT "FK_target_currency" 
       FOREIGN KEY ("targetCurrencyId") 
       REFERENCES "currency"("id") 
       ON DELETE NO ACTION 
       ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_dc18daa696860586ba4667a9d31"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_75e2be4ce11d447ef43be0e374f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_dc18daa696863796ba4667a9d31"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`,
    );
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f0e1b4ecdca13b177e2e3a0613"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_58e4dbff0e1a32a9bdc861bb29"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9bd2fe7a8e694dedc4ec2f666f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "currency_pairs" DROP CONSTRAINT "FK_target_currency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "currency_pairs" DROP CONSTRAINT "FK_base_currency"`,
    );
    await queryRunner.query(`DROP TABLE "payment_method"`);
    await queryRunner.query(`DROP TABLE "currency_pairs"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "file"`);
    await queryRunner.query(`DROP TABLE "status"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "referralCode"`);
    await queryRunner.query(`DROP TABLE "currency"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP TABLE "feeSchedule"`);
    await queryRunner.query(`DROP TABLE "languages"`);
    await queryRunner.query(`DROP TABLE "blockTgUserId"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
    await queryRunner.query(`DROP TABLE "chat_messages"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
