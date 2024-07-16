import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v1 from '../v1'

export const bondAndStake =  {
    name: 'DappsStaking.BondAndStake',
    /**
     * Account has bonded and staked funds on a smart contract.
     */
    v1: new EventType(
        'DappsStaking.BondAndStake',
        sts.tuple([v1.AccountId32, v1.SmartContract, sts.bigint()])
    ),
}

export const unbondAndUnstake =  {
    name: 'DappsStaking.UnbondAndUnstake',
    /**
     * Account has unbonded & unstaked some funds. Unbonding process begins.
     */
    v1: new EventType(
        'DappsStaking.UnbondAndUnstake',
        sts.tuple([v1.AccountId32, v1.SmartContract, sts.bigint()])
    ),
}

export const withdrawFromUnregistered =  {
    name: 'DappsStaking.WithdrawFromUnregistered',
    /**
     * Account has fully withdrawn all staked amount from an unregistered contract.
     */
    v1: new EventType(
        'DappsStaking.WithdrawFromUnregistered',
        sts.tuple([v1.AccountId32, v1.SmartContract, sts.bigint()])
    ),
}

export const withdrawn =  {
    name: 'DappsStaking.Withdrawn',
    /**
     * Account has withdrawn unbonded funds.
     */
    v1: new EventType(
        'DappsStaking.Withdrawn',
        sts.tuple([v1.AccountId32, sts.bigint()])
    ),
}

export const nominationTransfer =  {
    name: 'DappsStaking.NominationTransfer',
    /**
     * Nomination part has been transfered from one contract to another.
     * 
     * \(staker account, origin smart contract, amount, target smart contract\)
     */
    v1: new EventType(
        'DappsStaking.NominationTransfer',
        sts.tuple([v1.AccountId32, v1.SmartContract, sts.bigint(), v1.SmartContract])
    ),
}
