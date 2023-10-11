import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class CallByEra {
    constructor(props?: Partial<CallByEra>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    contractAddress!: string

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    era!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    numberOfCalls!: bigint

    @Column_("text", {array: true, nullable: false})
    activeUsers!: (string | undefined | null)[]

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    uniqueActiveUsers!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    timestamp!: bigint | undefined | null

    @Column_("int4", {nullable: true})
    startBlock!: number | undefined | null

    @Column_("int4", {nullable: true})
    endBlock!: number | undefined | null
}
