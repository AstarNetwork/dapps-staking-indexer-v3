import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {LockType} from "./_lockType"

@Entity_()
export class Locks {
    constructor(props?: Partial<Locks>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    lockerAddress!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    amount!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    timestamp!: bigint

    @Column_("varchar", {length: 9, nullable: false})
    type!: LockType
}
