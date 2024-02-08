module.exports = class Data1706807018488 {
    name = 'Data1706807018488'

    async up(db) {
        await db.query(`CREATE TABLE "staking_event" ("id" character varying NOT NULL, "user_address" text NOT NULL, "transaction" character varying(24) NOT NULL, "contract_address" text, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, "block_number" numeric NOT NULL, CONSTRAINT "PK_c4f2c390140b9ff847dae450025" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_bf57546d0830663995fba64604" ON "staking_event" ("user_address") `)
        await db.query(`CREATE INDEX "IDX_1370b69ea0d052073defb22878" ON "staking_event" ("timestamp") `)
        await db.query(`CREATE TABLE "grouped_staking_event" ("id" character varying NOT NULL, "transaction" character varying(24) NOT NULL, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_88b57b74393a04c826d2c93bb53" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_1eefa785dca578625fb9dccbe4" ON "grouped_staking_event" ("timestamp") `)
        await db.query(`CREATE TABLE "reward_event" ("id" character varying NOT NULL, "user_address" text NOT NULL, "transaction" character varying(11) NOT NULL, "contract_address" text, "tier_id" integer, "era" numeric, "period" integer, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, "block_number" numeric NOT NULL, CONSTRAINT "PK_212058fe00a4e4ad6f433833992" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_4c6d45375a937638016b85ea29" ON "reward_event" ("user_address") `)
        await db.query(`CREATE INDEX "IDX_ba2a7b2ade587a9495f81e9e76" ON "reward_event" ("transaction") `)
        await db.query(`CREATE INDEX "IDX_32c335d826e7606e7dec0bcd59" ON "reward_event" ("timestamp") `)
        await db.query(`CREATE TABLE "reward_aggregated_daily" ("id" character varying NOT NULL, "beneficiary" text NOT NULL, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_0e042d9be72b7ce07ddb6283252" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_d0f49bc20eeba38e4d97dc7229" ON "reward_aggregated_daily" ("beneficiary") `)
        await db.query(`CREATE INDEX "IDX_68a22f5a7c3638252edca0dd03" ON "reward_aggregated_daily" ("timestamp") `)
        await db.query(`CREATE TABLE "dapp" ("id" character varying NOT NULL, "dapp_id" integer NOT NULL, "owner" text NOT NULL, "beneficiary" text, "state" character varying(12) NOT NULL, "registered_at" numeric NOT NULL, "registration_block_number" integer NOT NULL, "unregistered_at" numeric, "unregistration_block_number" integer, "stakers_count" integer NOT NULL, CONSTRAINT "PK_0ae9da012097f3d50d780776fda" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "dapp_aggregated_daily" ("id" character varying NOT NULL, "dapp_address" text NOT NULL, "stakers_count" integer NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_5be32eee504804e856c801da739" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_25d93df5e1afaedab330a9d50f" ON "dapp_aggregated_daily" ("dapp_address") `)
        await db.query(`CREATE INDEX "IDX_326c85ce584c6d66d08476a05f" ON "dapp_aggregated_daily" ("timestamp") `)
        await db.query(`CREATE TABLE "stakers" ("id" character varying NOT NULL, "dapp_address" text NOT NULL, "staker_address" text NOT NULL, "amount" numeric NOT NULL, CONSTRAINT "PK_3da4a784c61e62ade7612c317e8" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_a3fa58190cd34626ff07e4c77e" ON "stakers" ("dapp_address") `)
        await db.query(`CREATE INDEX "IDX_e0a39337393345767f5ade298e" ON "stakers" ("staker_address") `)
        await db.query(`CREATE TABLE "unique_staker_address" ("id" character varying NOT NULL, CONSTRAINT "PK_396b05e05e564212be42284f5e9" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "stakers_count_aggregated_daily" ("id" character varying NOT NULL, "block_number" integer NOT NULL, "stakers_count" integer NOT NULL, "stakers_amount" numeric NOT NULL, CONSTRAINT "PK_9af211e5eba11987c7974e35e6b" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "tvl_aggregated_daily" ("id" character varying NOT NULL, "block_number" integer NOT NULL, "tvl" numeric NOT NULL, CONSTRAINT "PK_e3005bb3fc1befe9262ed239987" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "stake" ("id" character varying NOT NULL, "dapp_address" text NOT NULL, "staker_address" text NOT NULL, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, "block_number" integer NOT NULL, "expired_at" numeric, "expired_block_number" integer, CONSTRAINT "PK_8cfd82a65916af9d517d25a894e" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_8eeec8a2e938afa3ec806f3dff" ON "stake" ("dapp_address") `)
        await db.query(`CREATE INDEX "IDX_ad3d50534c02a5dd642593a9b8" ON "stake" ("expired_at") `)
        await db.query(`CREATE TABLE "subperiod" ("id" character varying NOT NULL, "type" character varying(12) NOT NULL, "block_number" integer NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_146e2c5964c45574297fd34f99a" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_505d7a5596fd04e6362811a651" ON "subperiod" ("timestamp") `)
    }

    async down(db) {
        await db.query(`DROP TABLE "staking_event"`)
        await db.query(`DROP INDEX "public"."IDX_bf57546d0830663995fba64604"`)
        await db.query(`DROP INDEX "public"."IDX_1370b69ea0d052073defb22878"`)
        await db.query(`DROP TABLE "grouped_staking_event"`)
        await db.query(`DROP INDEX "public"."IDX_1eefa785dca578625fb9dccbe4"`)
        await db.query(`DROP TABLE "reward_event"`)
        await db.query(`DROP INDEX "public"."IDX_4c6d45375a937638016b85ea29"`)
        await db.query(`DROP INDEX "public"."IDX_ba2a7b2ade587a9495f81e9e76"`)
        await db.query(`DROP INDEX "public"."IDX_32c335d826e7606e7dec0bcd59"`)
        await db.query(`DROP TABLE "reward_aggregated_daily"`)
        await db.query(`DROP INDEX "public"."IDX_d0f49bc20eeba38e4d97dc7229"`)
        await db.query(`DROP INDEX "public"."IDX_68a22f5a7c3638252edca0dd03"`)
        await db.query(`DROP TABLE "dapp"`)
        await db.query(`DROP TABLE "dapp_aggregated_daily"`)
        await db.query(`DROP INDEX "public"."IDX_25d93df5e1afaedab330a9d50f"`)
        await db.query(`DROP INDEX "public"."IDX_326c85ce584c6d66d08476a05f"`)
        await db.query(`DROP TABLE "stakers"`)
        await db.query(`DROP INDEX "public"."IDX_a3fa58190cd34626ff07e4c77e"`)
        await db.query(`DROP INDEX "public"."IDX_e0a39337393345767f5ade298e"`)
        await db.query(`DROP TABLE "unique_staker_address"`)
        await db.query(`DROP TABLE "stakers_count_aggregated_daily"`)
        await db.query(`DROP TABLE "tvl_aggregated_daily"`)
        await db.query(`DROP TABLE "stake"`)
        await db.query(`DROP INDEX "public"."IDX_8eeec8a2e938afa3ec806f3dff"`)
        await db.query(`DROP INDEX "public"."IDX_ad3d50534c02a5dd642593a9b8"`)
        await db.query(`DROP TABLE "subperiod"`)
        await db.query(`DROP INDEX "public"."IDX_505d7a5596fd04e6362811a651"`)
    }
}
