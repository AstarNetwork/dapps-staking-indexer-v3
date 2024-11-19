import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class UniqueStakerAddress {
    constructor(props?: Partial<UniqueStakerAddress>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string
}
