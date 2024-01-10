module.exports = class Data1704843890032 {
    name = 'Data1704843890032'

    async up(db) {
        await db.query(`ALTER TABLE "reward_aggregated_daily" ADD "transaction" character varying(11) NOT NULL`)
        await db.query(`ALTER TABLE "reward_aggregated_daily" ADD "contract_address" text`)
        await db.query(`CREATE INDEX "IDX_be517f54747f90a2ee1c0cf6bb" ON "reward_aggregated_daily" ("contract_address") `)
    }

    async down(db) {
        await db.query(`ALTER TABLE "reward_aggregated_daily" DROP COLUMN "transaction"`)
        await db.query(`ALTER TABLE "reward_aggregated_daily" DROP COLUMN "contract_address"`)
        await db.query(`DROP INDEX "public"."IDX_be517f54747f90a2ee1c0cf6bb"`)
    }
}
