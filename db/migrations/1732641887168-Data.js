module.exports = class Data1732641887168 {
    name = 'Data1732641887168'

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
        await db.query(`CREATE TABLE "unique_locker_address" ("id" character varying NOT NULL, "amount" numeric NOT NULL, CONSTRAINT "PK_735d060368d3b390d435e94b623" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "stakers_count_aggregated_daily" ("id" character varying NOT NULL, "block_number" integer NOT NULL, "stakers_count" integer NOT NULL, "stakers_amount" numeric NOT NULL, "usd_price" numeric NOT NULL, CONSTRAINT "PK_9af211e5eba11987c7974e35e6b" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "tvl_aggregated_daily" ("id" character varying NOT NULL, "block_number" integer NOT NULL, "lockers_count" integer NOT NULL, "tvl" numeric NOT NULL, "usd_price" numeric NOT NULL, CONSTRAINT "PK_e3005bb3fc1befe9262ed239987" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "stake" ("id" character varying NOT NULL, "dapp_address" text NOT NULL, "staker_address" text NOT NULL, "staker_address_evm" text, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, "block_number" integer NOT NULL, "period" integer NOT NULL, CONSTRAINT "PK_8cfd82a65916af9d517d25a894e" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_8eeec8a2e938afa3ec806f3dff" ON "stake" ("dapp_address") `)
        await db.query(`CREATE INDEX "IDX_baf129fd75e87247e7ebf94003" ON "stake" ("period") `)
        await db.query(`CREATE TABLE "subperiod" ("id" character varying NOT NULL, "type" character varying(12) NOT NULL, "block_number" integer NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_146e2c5964c45574297fd34f99a" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_505d7a5596fd04e6362811a651" ON "subperiod" ("timestamp") `)
        await db.query(`CREATE TABLE "stakes_per_dap_and_period" ("id" character varying NOT NULL, "dapp_address" text NOT NULL, "period" integer NOT NULL, "stake_amount" numeric NOT NULL, "reward_amount" numeric NOT NULL, CONSTRAINT "PK_8acd6ae40c5881dc53c24720a2f" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_1c1b10c923d2ebdd3ac8d87d02" ON "stakes_per_dap_and_period" ("dapp_address") `)
        await db.query(`CREATE TABLE "stakes_per_staker_and_period" ("id" character varying NOT NULL, "staker_address" text NOT NULL, "period" integer NOT NULL, "stake_amount" numeric NOT NULL, "staker_reward_amount" numeric NOT NULL, "bonus_reward_amount" numeric NOT NULL, CONSTRAINT "PK_e69ff091b64238cf249326fe2e9" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_4c22135a244adc9988f23a6cb4" ON "stakes_per_staker_and_period" ("staker_address") `)
        await db.query(`CREATE TABLE "burn" ("id" character varying NOT NULL, "user" text NOT NULL, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, "block_number" integer NOT NULL, CONSTRAINT "PK_dcb4f14ee4534154b31116553f0" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_3c0a942287940dbfea8949b919" ON "burn" ("user") `)
        await db.query(`CREATE TABLE "address_mapping" ("id" character varying NOT NULL, "ss58_address" text NOT NULL, "mapped_at_block" integer NOT NULL, CONSTRAINT "PK_8611a631b9c1187979a08ecb53f" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_53d3b98caff3fa93890854df99" ON "address_mapping" ("ss58_address") `)
        await db.query(`CREATE TABLE "era_period_mapping" ("id" character varying NOT NULL, "period" integer NOT NULL, CONSTRAINT "PK_f2cc5cf5608926b3bf95ab27588" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "total_issuance" ("id" character varying NOT NULL, "timestamp" numeric NOT NULL, "balance" numeric NOT NULL, CONSTRAINT "PK_9cdf75245e881dc54db2b9c2553" PRIMARY KEY ("id"))`)
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
        await db.query(`DROP TABLE "unique_locker_address"`)
        await db.query(`DROP TABLE "stakers_count_aggregated_daily"`)
        await db.query(`DROP TABLE "tvl_aggregated_daily"`)
        await db.query(`DROP TABLE "stake"`)
        await db.query(`DROP INDEX "public"."IDX_8eeec8a2e938afa3ec806f3dff"`)
        await db.query(`DROP INDEX "public"."IDX_baf129fd75e87247e7ebf94003"`)
        await db.query(`DROP TABLE "subperiod"`)
        await db.query(`DROP INDEX "public"."IDX_505d7a5596fd04e6362811a651"`)
        await db.query(`DROP TABLE "stakes_per_dap_and_period"`)
        await db.query(`DROP INDEX "public"."IDX_1c1b10c923d2ebdd3ac8d87d02"`)
        await db.query(`DROP TABLE "stakes_per_staker_and_period"`)
        await db.query(`DROP INDEX "public"."IDX_4c22135a244adc9988f23a6cb4"`)
        await db.query(`DROP TABLE "burn"`)
        await db.query(`DROP INDEX "public"."IDX_3c0a942287940dbfea8949b919"`)
        await db.query(`DROP TABLE "address_mapping"`)
        await db.query(`DROP INDEX "public"."IDX_53d3b98caff3fa93890854df99"`)
        await db.query(`DROP TABLE "era_period_mapping"`)
        await db.query(`DROP TABLE "total_issuance"`)
    }
}
