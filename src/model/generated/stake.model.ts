import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class Stake {
    constructor(props?: Partial<Stake>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    dappAddress!: string

    @Column_("text", {nullable: false})
    stakerAddress!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amount!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    timestamp!: bigint

    @Column_("int4", {nullable: false})
    blockNumber!: number

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    expiredAt!: bigint | undefined | null

    @Column_("int4", {nullable: true})
    expiredBlockNumber!: number | undefined | null
}
