import {sts, Block, Bytes, Option, Result, StorageType, RuntimeCtx} from '../support'

export const totalIssuance =  {
    /**
     *  The total units issued in the system.
     */
    v1: new StorageType('Balances.TotalIssuance', 'Default', [], sts.bigint()) as TotalIssuanceV1,
}

/**
 *  The total units issued in the system.
 */
export interface TotalIssuanceV1  {
    is(block: RuntimeCtx): boolean
    getDefault(block: Block): bigint
    get(block: Block): Promise<(bigint | undefined)>
}
