import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Stakers {
    constructor(props?: Partial<Stakers>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    dappAddress!: string

    @Index_()
    @StringColumn_({nullable: false})
    stakerAddress!: string

    @BigIntColumn_({nullable: false})
    amount!: bigint
}
