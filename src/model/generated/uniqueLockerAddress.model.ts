import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"

@Entity_()
export class UniqueLockerAddress {
    constructor(props?: Partial<UniqueLockerAddress>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string
}
