import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_, FloatColumn as FloatColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class StakersCountAggregatedDaily {
    constructor(props?: Partial<StakersCountAggregatedDaily>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: false})
    blockNumber!: number

    @IntColumn_({nullable: false})
    stakersCount!: number

    @BigIntColumn_({nullable: false})
    stakersAmount!: bigint

    @FloatColumn_({nullable: false})
    usdPrice!: number
}
