import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class StakesPerDapAndPeriod {
    constructor(props?: Partial<StakesPerDapAndPeriod>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    dappAddress!: string

    @Column_("int4", {nullable: false})
    period!: number

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    stakeAmount!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    rewardAmount!: bigint
}
