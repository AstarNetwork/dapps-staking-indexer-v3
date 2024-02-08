import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {RewardEventType} from "./_rewardEventType"

@Entity_()
export class RewardEvent {
    constructor(props?: Partial<RewardEvent>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    userAddress!: string

    @Index_()
    @Column_("varchar", {length: 11, nullable: false})
    transaction!: RewardEventType

    @Column_("text", {nullable: true})
    contractAddress!: string | undefined | null

    @Column_("int4", {nullable: true})
    tierId!: number | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    era!: bigint | undefined | null

    @Column_("int4", {nullable: true})
    period!: number | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amount!: bigint

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    timestamp!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    blockNumber!: bigint
}
