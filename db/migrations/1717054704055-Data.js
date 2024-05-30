module.exports = class Data1717054704055 {
    name = 'Data1717054704055'

    async up(db) {
        await db.query(`ALTER TABLE "stakers_count_aggregated_daily" ADD "usd_price" numeric NOT NULL`)
        await db.query(`ALTER TABLE "tvl_aggregated_daily" ADD "usd_price" numeric NOT NULL`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "stakers_count_aggregated_daily" DROP COLUMN "usd_price"`)
        await db.query(`ALTER TABLE "tvl_aggregated_daily" DROP COLUMN "usd_price"`)
    }
}
