import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_, FloatColumn as FloatColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class TvlAggregatedDaily {
    constructor(props?: Partial<TvlAggregatedDaily>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: false})
    blockNumber!: number

    @IntColumn_({nullable: false})
    lockersCount!: number

    @BigIntColumn_({nullable: false})
    tvl!: bigint

    @FloatColumn_({nullable: false})
    usdPrice!: number
}
