import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class EraPeriodMapping {
    constructor(props?: Partial<EraPeriodMapping>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: false})
    period!: number
}
