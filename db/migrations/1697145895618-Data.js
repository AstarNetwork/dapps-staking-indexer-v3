module.exports = class Data1697145895618 {
    name = 'Data1697145895618'

    async up(db) {
        await db.query(`CREATE TABLE "staking_event" ("id" character varying NOT NULL, "user_address" text NOT NULL, "transaction" character varying(24) NOT NULL, "contract_address" text, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, "block_number" numeric NOT NULL, CONSTRAINT "PK_c4f2c390140b9ff847dae450025" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_bf57546d0830663995fba64604" ON "staking_event" ("user_address") `)
        await db.query(`CREATE INDEX "IDX_1370b69ea0d052073defb22878" ON "staking_event" ("timestamp") `)
        await db.query(`CREATE TABLE "grouped_staking_event" ("id" character varying NOT NULL, "transaction" character varying(24) NOT NULL, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, CONSTRAINT "PK_88b57b74393a04c826d2c93bb53" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_1eefa785dca578625fb9dccbe4" ON "grouped_staking_event" ("timestamp") `)
    }

    async down(db) {
        await db.query(`DROP TABLE "staking_event"`)
        await db.query(`DROP INDEX "public"."IDX_bf57546d0830663995fba64604"`)
        await db.query(`DROP INDEX "public"."IDX_1370b69ea0d052073defb22878"`)
        await db.query(`DROP TABLE "grouped_staking_event"`)
        await db.query(`DROP INDEX "public"."IDX_1eefa785dca578625fb9dccbe4"`)
    }
}
