import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class StakesPerDapAndPeriod {
    constructor(props?: Partial<StakesPerDapAndPeriod>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    dappAddress!: string

    @IntColumn_({nullable: false})
    period!: number

    @BigIntColumn_({nullable: false})
    stakeAmount!: bigint

    @BigIntColumn_({nullable: false})
    rewardAmount!: bigint
}
