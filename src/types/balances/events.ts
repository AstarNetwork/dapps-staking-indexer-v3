import {sts, Block, Bytes, Option, Result, EventType} from '../support'
import * as v1 from '../v1'
import * as v3 from '../v3'

export const transfer =  {
    name: 'Balances.Transfer',
    /**
     * Transfer succeeded. \[from, to, value\]
     */
    v1: new EventType(
        'Balances.Transfer',
        sts.tuple([v1.AccountId32, v1.AccountId32, sts.bigint()])
    ),
    /**
     * Transfer succeeded.
     */
    v3: new EventType(
        'Balances.Transfer',
        sts.struct({
            from: v3.AccountId32,
            to: v3.AccountId32,
            amount: sts.bigint(),
        })
    ),
}
