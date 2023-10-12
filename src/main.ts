import {BigDecimal} from '@subsquid/big-decimal'
import * as ss58 from '@subsquid/ss58'
import {Bytes} from '@subsquid/substrate-runtime'
import {TypeormDatabase} from '@subsquid/typeorm-store'

import {StakingEvent, UserTransactionType} from './model'
import {events} from './types'
import {processor} from './processor'

// supportHotBlocks: true is actually the default, adding it so that it's obvious how to disable it
processor.run(new TypeormDatabase({supportHotBlocks: true}), async ctx => {

    let stakingEvents: StakingEvent[] = []

    for (let block of ctx.blocks) {
        for (let event of block.events) {
            if (event.name == events.dappsStaking.bondAndStake.name) {
                let decoded: {account: string, contractAddr: string, amount: bigint}
                if (events.dappsStaking.bondAndStake.v4.is(event)) {
                    let [account, contract, amount] = events.dappsStaking.bondAndStake.v4.decode(event)
                    decoded = {
                        account,
                        contractAddr: contract.value,
                        amount
                    }
                } else {
                    ctx.log.error(`Unknown runtime version for a BondAndState event`)
                    continue
                }

                if (event.block.timestamp) {
                    let s = new StakingEvent({
                        id: event.id,
                        userAddress: decoded.account,
                        transaction: UserTransactionType.BondAndStake,
                        contractAddress: decoded.contractAddr,
                        amount: decoded.amount,
                        timestamp: BigInt(event.block.timestamp.valueOf()),
                        blockNumber: BigInt(block.header.height),
                    })
                    stakingEvents.push(s);
                }

            }
            else if (event.name == events.dappsStaking.nominationTransfer.name) {
                let decoded: {account: string, originAddr: string, amount: bigint, targetAddr: string}
                if (events.dappsStaking.nominationTransfer.v17.is(event)) {
                    let [account, origin, amount, target] = events.dappsStaking.nominationTransfer.v17.decode(event)
                    decoded = {
                        account,
                        originAddr: origin.value,
                        amount,
                        targetAddr: target.value
                    }
                } else {
                    ctx.log.error(`Unknown runtime version for a NominationTransfer event`)
                    continue
                }

                if (event.block.timestamp) {
                    let s = new StakingEvent({
                        id: event.id,
                        userAddress: decoded.account,
                        transaction: UserTransactionType.NominationTransfer,
                        contractAddress: decoded.targetAddr, // targetAddr as contractAddress?
                        amount: decoded.amount,
                        timestamp: BigInt(event.block.timestamp.valueOf()),
                        blockNumber: BigInt(block.header.height),
                    })
                    stakingEvents.push(s);
                }
            }
            else if (event.name == events.dappsStaking.unbondAndUnstake.name) {
                let decoded: {account: string, contractAddr: string, amount: bigint}
                if (events.dappsStaking.unbondAndUnstake.v12.is(event)) {
                    let [account, contract, amount] = events.dappsStaking.unbondAndUnstake.v12.decode(event)
                    decoded = {
                        account,
                        contractAddr: contract.value,
                        amount,
                    }
                } else {
                    ctx.log.error(`Unknown runtime version for an UnbondAndUnstake event`)
                    continue
                }

                if (event.block.timestamp) {
                    let s = new StakingEvent({
                        id: event.id,
                        userAddress: decoded.account,
                        transaction: UserTransactionType.UnbondAndUnstake,
                        contractAddress: decoded.contractAddr,
                        amount: decoded.amount,
                        timestamp: BigInt(event.block.timestamp.valueOf()),
                        blockNumber: BigInt(block.header.height),
                    })
                    stakingEvents.push(s);
                }
            }
        }
    }

    await ctx.store.insert(stakingEvents)
})
