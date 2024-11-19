import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class DappAggregatedDaily {
    constructor(props?: Partial<DappAggregatedDaily>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    dappAddress!: string

    @IntColumn_({nullable: false})
    stakersCount!: number

    @Index_()
    @BigIntColumn_({nullable: false})
    timestamp!: bigint
}
