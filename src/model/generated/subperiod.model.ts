import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
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

    @Column_("int4", {nullable: false})
    blockNumber!: number

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    timestamp!: bigint
}
