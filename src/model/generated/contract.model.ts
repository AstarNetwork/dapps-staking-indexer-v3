import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class Contract {
    constructor(props?: Partial<Contract>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    registrationEra!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    registrationBlock!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    registrationTimestamp!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    unregistrationEra!: bigint | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    unregistrationTimestamp!: bigint | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    unregistrationBlock!: bigint | undefined | null
}
