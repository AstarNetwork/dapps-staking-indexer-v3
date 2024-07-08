module.exports = class Data1720186311258 {
    name = 'Data1720186311258'

    async up(db) {
        await db.query(`CREATE TABLE "stakes_per_staker_and_period" ("id" character varying NOT NULL, "staker_address" text NOT NULL, "period" integer NOT NULL, "stake_amount" numeric NOT NULL, "staker_reward_amount" numeric NOT NULL, "bonus_reward_amount" numeric NOT NULL, CONSTRAINT "PK_e69ff091b64238cf249326fe2e9" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_4c22135a244adc9988f23a6cb4" ON "stakes_per_staker_and_period" ("staker_address") `)
    }

    async down(db) {
        await db.query(`DROP TABLE "stakes_per_staker_and_period"`)
        await db.query(`DROP INDEX "public"."IDX_4c22135a244adc9988f23a6cb4"`)
    }
}
