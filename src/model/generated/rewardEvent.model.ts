import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"
import {RewardEventType} from "./_rewardEventType"

@Entity_()
export class RewardEvent {
    constructor(props?: Partial<RewardEvent>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    userAddress!: string

    @Index_()
    @Column_("varchar", {length: 11, nullable: false})
    transaction!: RewardEventType

    @StringColumn_({nullable: true})
    contractAddress!: string | undefined | null

    @IntColumn_({nullable: true})
    tierId!: number | undefined | null

    @BigIntColumn_({nullable: true})
    era!: bigint | undefined | null

    @IntColumn_({nullable: true})
    period!: number | undefined | null

    @BigIntColumn_({nullable: false})
    amount!: bigint

    @Index_()
    @BigIntColumn_({nullable: false})
    timestamp!: bigint

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint
}
