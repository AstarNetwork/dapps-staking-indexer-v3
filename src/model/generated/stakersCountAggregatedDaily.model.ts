import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"

@Entity_()
export class StakersCountAggregatedDaily {
    constructor(props?: Partial<StakersCountAggregatedDaily>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("int4", {nullable: false})
    blockNumber!: number

    @Column_("int4", {nullable: false})
    stakersCount!: number
}
