import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"
import {UserTransactionType} from "./_userTransactionType"

@Entity_()
export class StakingEvent {
    constructor(props?: Partial<StakingEvent>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    userAddress!: string

    @Column_("varchar", {length: 24, nullable: false})
    transaction!: UserTransactionType

    @StringColumn_({nullable: true})
    contractAddress!: string | undefined | null

    @BigIntColumn_({nullable: false})
    amount!: bigint

    @Index_()
    @BigIntColumn_({nullable: false})
    timestamp!: bigint

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint
}
