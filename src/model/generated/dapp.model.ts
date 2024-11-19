import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"
import {DappState} from "./_dappState"

@Entity_()
export class Dapp {
    constructor(props?: Partial<Dapp>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: false})
    dappId!: number

    @StringColumn_({nullable: false})
    owner!: string

    @StringColumn_({nullable: true})
    beneficiary!: string | undefined | null

    @Column_("varchar", {length: 12, nullable: false})
    state!: DappState

    @BigIntColumn_({nullable: false})
    registeredAt!: bigint

    @IntColumn_({nullable: false})
    registrationBlockNumber!: number

    @BigIntColumn_({nullable: true})
    unregisteredAt!: bigint | undefined | null

    @IntColumn_({nullable: true})
    unregistrationBlockNumber!: number | undefined | null

    @IntColumn_({nullable: false})
    stakersCount!: number
}
