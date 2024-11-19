module.exports = class Data1730972119470 {
    name = 'Data1730972119470'

    async up(db) {
        await db.query(`CREATE TABLE "era_period_mapping" ("id" character varying NOT NULL, "period" integer NOT NULL, CONSTRAINT "PK_f2cc5cf5608926b3bf95ab27588" PRIMARY KEY ("id"))`)
    }

    async down(db) {
        await db.query(`DROP TABLE "era_period_mapping"`)
    }
}
