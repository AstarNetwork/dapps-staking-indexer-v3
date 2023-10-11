module.exports = class Data1697037850073 {
    name = 'Data1697037850073'

    async up(db) {
        await db.query(`CREATE TABLE "transfer" ("id" character varying NOT NULL, "timestamp" numeric NOT NULL, "from" text NOT NULL, "to" text NOT NULL, "amount" numeric NOT NULL, "tags" text array, CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_f4007436c1b546ede08a4fd7ab" ON "transfer" ("amount") `)
        await db.query(`CREATE INDEX "IDX_2e921e683d651101b2f4b5c6f3" ON "transfer" ("timestamp", "from", "to") `)
        await db.query(`CREATE INDEX "IDX_807712b152d3409e4cc1bf5361" ON "transfer" ("from", "to") `)
        await db.query(`CREATE TABLE "call_by_era" ("id" character varying NOT NULL, "contract_address" text NOT NULL, "era" numeric NOT NULL, "number_of_calls" numeric NOT NULL, "active_users" text array NOT NULL, "unique_active_users" numeric NOT NULL, "timestamp" numeric, "start_block" integer, "end_block" integer, CONSTRAINT "PK_20dd900ffbe8bbe56f4feb32360" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_b00324814525635c0422a3fdac" ON "call_by_era" ("contract_address") `)
        await db.query(`CREATE INDEX "IDX_2a15bedc674cdf287e4206b374" ON "call_by_era" ("era") `)
        await db.query(`CREATE TABLE "staking_event" ("id" character varying NOT NULL, "user_address" text NOT NULL, "transaction" character varying(24) NOT NULL, "contract_address" text, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, "block_number" numeric NOT NULL, CONSTRAINT "PK_c4f2c390140b9ff847dae450025" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_bf57546d0830663995fba64604" ON "staking_event" ("user_address") `)
        await db.query(`CREATE INDEX "IDX_1370b69ea0d052073defb22878" ON "staking_event" ("timestamp") `)
        await db.query(`CREATE TABLE "era" ("id" character varying NOT NULL, "block" numeric NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_a30749cdf0189d890a8dbc9aa7d" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "contract" ("id" character varying NOT NULL, "registration_era" numeric NOT NULL, "registration_block" numeric NOT NULL, "registration_timestamp" numeric NOT NULL, "unregistration_era" numeric, "unregistration_timestamp" numeric, "unregistration_block" numeric, CONSTRAINT "PK_17c3a89f58a2997276084e706e8" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "user_transaction" ("id" character varying NOT NULL, "user_address" text NOT NULL, "transaction" character varying(24) NOT NULL, "transaction_hash" text NOT NULL, "transaction_success" boolean NOT NULL, "contract_address" text, "amount" numeric, "timestamp" numeric NOT NULL, "block_number" numeric NOT NULL, CONSTRAINT "PK_e36b77a5263ac0f191277c4c5d2" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_27e25b59556b49de7b7fe546f1" ON "user_transaction" ("user_address") `)
        await db.query(`CREATE INDEX "IDX_54a7cfe2790215d1a83388a009" ON "user_transaction" ("timestamp") `)
    }

    async down(db) {
        await db.query(`DROP TABLE "transfer"`)
        await db.query(`DROP INDEX "public"."IDX_f4007436c1b546ede08a4fd7ab"`)
        await db.query(`DROP INDEX "public"."IDX_2e921e683d651101b2f4b5c6f3"`)
        await db.query(`DROP INDEX "public"."IDX_807712b152d3409e4cc1bf5361"`)
        await db.query(`DROP TABLE "call_by_era"`)
        await db.query(`DROP INDEX "public"."IDX_b00324814525635c0422a3fdac"`)
        await db.query(`DROP INDEX "public"."IDX_2a15bedc674cdf287e4206b374"`)
        await db.query(`DROP TABLE "staking_event"`)
        await db.query(`DROP INDEX "public"."IDX_bf57546d0830663995fba64604"`)
        await db.query(`DROP INDEX "public"."IDX_1370b69ea0d052073defb22878"`)
        await db.query(`DROP TABLE "era"`)
        await db.query(`DROP TABLE "contract"`)
        await db.query(`DROP TABLE "user_transaction"`)
        await db.query(`DROP INDEX "public"."IDX_27e25b59556b49de7b7fe546f1"`)
        await db.query(`DROP INDEX "public"."IDX_54a7cfe2790215d1a83388a009"`)
    }
}
