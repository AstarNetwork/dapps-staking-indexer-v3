import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {RewardEventType} from "./_rewardEventType"

@Entity_()
export class RewardAggregatedDaily {
    constructor(props?: Partial<RewardAggregatedDaily>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    beneficiary!: string

    @Column_("varchar", {length: 11, nullable: false})
    transaction!: RewardEventType

    @Index_()
    @Column_("text", {nullable: true})
    contractAddress!: string | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amount!: bigint

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    timestamp!: bigint
}
