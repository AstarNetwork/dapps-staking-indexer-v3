import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, Index as Index_} from "@subsquid/typeorm-store"
import {UserTransactionType} from "./_userTransactionType"

@Entity_()
export class GroupedStakingEvent {
    constructor(props?: Partial<GroupedStakingEvent>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("varchar", {length: 24, nullable: false})
    transaction!: UserTransactionType

    @BigIntColumn_({nullable: false})
    amount!: bigint

    @Index_()
    @BigIntColumn_({nullable: false})
    timestamp!: bigint
}
