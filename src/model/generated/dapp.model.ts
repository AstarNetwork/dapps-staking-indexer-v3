import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {DappState} from "./_dappState"

@Entity_()
export class Dapp {
    constructor(props?: Partial<Dapp>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("int4", {nullable: false})
    dappId!: number

    @Column_("text", {nullable: false})
    owner!: string

    @Column_("text", {nullable: true})
    beneficiary!: string | undefined | null

    @Column_("varchar", {length: 12, nullable: false})
    state!: DappState

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    registeredAt!: bigint

    @Column_("int4", {nullable: false})
    registrationBlockNumber!: number

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    unregisteredAt!: bigint | undefined | null

    @Column_("int4", {nullable: true})
    unregistrationBlockNumber!: number | undefined | null

    @Column_("int4", {nullable: false})
    stakersCount!: number
}
