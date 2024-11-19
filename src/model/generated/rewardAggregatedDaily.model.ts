import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class RewardAggregatedDaily {
    constructor(props?: Partial<RewardAggregatedDaily>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    beneficiary!: string

    @BigIntColumn_({nullable: false})
    amount!: bigint

    @Index_()
    @BigIntColumn_({nullable: false})
    timestamp!: bigint
}
