import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

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

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    stakersAmount!: bigint

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
    usdPrice!: number
}
