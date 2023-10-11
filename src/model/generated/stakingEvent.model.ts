import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {UserTransactionType} from "./_userTransactionType"

@Entity_()
export class StakingEvent {
    constructor(props?: Partial<StakingEvent>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    userAddress!: string

    @Column_("varchar", {length: 24, nullable: false})
    transaction!: UserTransactionType

    @Column_("text", {nullable: true})
    contractAddress!: string | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amount!: bigint

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    timestamp!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    blockNumber!: bigint
}
