import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v4 from '../v4'
import * as v12 from '../v12'
import * as v17 from '../v17'

export const bondAndStake =  {
    name: 'DappsStaking.BondAndStake',
    /**
     * Account has bonded and staked funds on a smart contract.
     */
    v4: new EventType(
        'DappsStaking.BondAndStake',
        sts.tuple([v4.AccountId32, v4.SmartContract, sts.bigint()])
    ),
}

export const unbondAndUnstake =  {
    name: 'DappsStaking.UnbondAndUnstake',
    /**
     * Account has unbonded & unstaked some funds. Unbonding process begins.
     */
    v12: new EventType(
        'DappsStaking.UnbondAndUnstake',
        sts.tuple([v12.AccountId32, v12.SmartContract, sts.bigint()])
    ),
}

export const withdrawFromUnregistered =  {
    name: 'DappsStaking.WithdrawFromUnregistered',
    /**
     * Account has fully withdrawn all staked amount from an unregistered contract.
     */
    v12: new EventType(
        'DappsStaking.WithdrawFromUnregistered',
        sts.tuple([v12.AccountId32, v12.SmartContract, sts.bigint()])
    ),
}

export const withdrawn =  {
    name: 'DappsStaking.Withdrawn',
    /**
     * Account has withdrawn unbonded funds.
     */
    v12: new EventType(
        'DappsStaking.Withdrawn',
        sts.tuple([v12.AccountId32, sts.bigint()])
    ),
}

export const nominationTransfer =  {
    name: 'DappsStaking.NominationTransfer',
    /**
     * Nomination part has been transfered from one contract to another.
     * 
     * \(staker account, origin smart contract, amount, target smart contract\)
     */
    v17: new EventType(
        'DappsStaking.NominationTransfer',
        sts.tuple([v17.AccountId32, v17.SmartContract, sts.bigint(), v17.SmartContract])
    ),
}
