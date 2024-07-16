import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v1 from '../v1'

export const burned =  {
    name: 'Balances.Burned',
    /**
     * Some amount was burned from an account.
     */
    v1: new EventType(
        'Balances.Burned',
        sts.struct({
            who: v1.AccountId32,
            amount: sts.bigint(),
        })
    ),
}
