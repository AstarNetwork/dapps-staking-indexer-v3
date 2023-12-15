import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"

@Entity_()
export class DappAggregatedDaily {
    constructor(props?: Partial<DappAggregatedDaily>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: false})
    dappAddress!: string

    @Column_("int4", {nullable: false})
    stakersCount!: number
}
