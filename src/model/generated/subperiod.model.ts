import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_, Index as Index_} from "@subsquid/typeorm-store"
import {SubperiodType} from "./_subperiodType"

@Entity_()
export class Subperiod {
    constructor(props?: Partial<Subperiod>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("varchar", {length: 12, nullable: false})
    type!: SubperiodType

    @IntColumn_({nullable: false})
    blockNumber!: number

    @Index_()
    @BigIntColumn_({nullable: false})
    timestamp!: bigint
}
