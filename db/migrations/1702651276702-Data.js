module.exports = class Data1702651276702 {
    name = 'Data1702651276702'

    async up(db) {
        await db.query(`ALTER TABLE "dapp_aggregated_daily" ADD "timestamp" numeric NOT NULL`)
        await db.query(`CREATE INDEX "IDX_25d93df5e1afaedab330a9d50f" ON "dapp_aggregated_daily" ("dapp_address") `)
        await db.query(`CREATE INDEX "IDX_326c85ce584c6d66d08476a05f" ON "dapp_aggregated_daily" ("timestamp") `)
    }

    async down(db) {
        await db.query(`ALTER TABLE "dapp_aggregated_daily" DROP COLUMN "timestamp"`)
        await db.query(`DROP INDEX "public"."IDX_25d93df5e1afaedab330a9d50f"`)
        await db.query(`DROP INDEX "public"."IDX_326c85ce584c6d66d08476a05f"`)
    }
}
