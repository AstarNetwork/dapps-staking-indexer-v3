import {sts, Block, Bytes, Option, Result, CallType, RuntimeCtx} from '../support'
import * as v1 from '../v1'

export const transact =  {
    name: 'Ethereum.transact',
    /**
     * Transact an Ethereum transaction.
     */
    v1: new CallType(
        'Ethereum.transact',
        sts.struct({
            transaction: v1.TransactionV2,
        })
    ),
}
