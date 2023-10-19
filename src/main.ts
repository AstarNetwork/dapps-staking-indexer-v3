import assert from 'assert'
import * as ss58 from '@subsquid/ss58'
import {Bytes} from '@subsquid/substrate-runtime'
import {TypeormDatabase, Store} from '@subsquid/typeorm-store'
import {Equal, MoreThanOrEqual} from 'typeorm'

import {GroupedStakingEvent, StakingEvent, UserTransactionType} from './model'
import {events} from './types'
import {processor, ProcessorContext} from './processor'
import {getDayIdentifier, getFirstTimestampOfTheNextDay, getFirstTimestampOfTheDay} from './utils'

// supportHotBlocks: true is actually the default, adding it so that it's obvious how to disable it
processor.run(new TypeormDatabase({supportHotBlocks: true}), async ctx => {

    let stakingEvents: StakingEvent[] = []

    for (let block of ctx.blocks) {
        assert(block.header.timestamp, `Got an undefined timestamp for block ${block.header.height}`)
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

                let s = new StakingEvent({
                    id: event.id,
                    userAddress: decoded.account,
                    transaction: UserTransactionType.BondAndStake,
                    contractAddress: decoded.contractAddr,
                    amount: decoded.amount,
                    timestamp: BigInt(block.header.timestamp),
                    blockNumber: BigInt(block.header.height),
                })
                stakingEvents.push(s);
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

                let s = new StakingEvent({
                    id: event.id,
                    userAddress: decoded.account,
                    transaction: UserTransactionType.NominationTransfer,
                    contractAddress: decoded.targetAddr, // targetAddr as contractAddress?
                    amount: decoded.amount,
                    timestamp: BigInt(block.header.timestamp),
                    blockNumber: BigInt(block.header.height),
                })
                stakingEvents.push(s);
            }
            else if (event.name == events.dappsStaking.withdrawn.name) {
                let decoded: {account: string, amount: bigint}
                if (events.dappsStaking.withdrawn.v12.is(event)) {
                    let [account, amount] = events.dappsStaking.withdrawn.v12.decode(event)
                    decoded = {
                        account,
                        amount
                    }
                } else {
                    ctx.log.error(`Unknown runtime version for a Withdrawn event`)
                    continue
                }

                let s = new StakingEvent({
                    id: event.id,
                    userAddress: decoded.account,
                    transaction: UserTransactionType.Withdraw,
                    amount: decoded.amount,
                    timestamp: BigInt(block.header.timestamp),
                    blockNumber: BigInt(block.header.height),
                })
                stakingEvents.push(s);
            }
            else if (event.name == events.dappsStaking.withdrawFromUnregistered.name) {
                let decoded: {account: string, contractAddr: string, amount: bigint}
                if (events.dappsStaking.withdrawFromUnregistered.v12.is(event)) {
                    let [account, contract, amount] = events.dappsStaking.withdrawFromUnregistered.v12.decode(event)
                    decoded = {
                        account,
                        contractAddr: contract.value,
                        amount
                    }
                } else {
                    ctx.log.error(`Unknown runtime version for a WithdrawFromUnregistered event`)
                    continue
                }

                let s = new StakingEvent({
                    id: event.id,
                    userAddress: decoded.account,
                    transaction: UserTransactionType.WithdrawFromUnregistered,
                    contractAddress: decoded.contractAddr,
                    amount: decoded.amount,
                    timestamp: BigInt(block.header.timestamp),
                    blockNumber: BigInt(block.header.height),
                })
                stakingEvents.push(s);
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

                let s = new StakingEvent({
                    id: event.id,
                    userAddress: decoded.account,
                    transaction: UserTransactionType.UnbondAndUnstake,
                    contractAddress: decoded.contractAddr,
                    amount: decoded.amount,
                    timestamp: BigInt(block.header.timestamp),
                    blockNumber: BigInt(block.header.height),
                })
                stakingEvents.push(s);
            }
        }
    }

    const bnsGroupedStakingEvents = await getGroupedStakingEvents(UserTransactionType.BondAndStake, stakingEvents, ctx)
    const unuGroupedStakingEvents = await getGroupedStakingEvents(UserTransactionType.UnbondAndUnstake, stakingEvents, ctx)
    const ntGroupedStakingEvents = await getGroupedStakingEvents(UserTransactionType.NominationTransfer, stakingEvents, ctx)
    const wGroupedStakingEvents = await getGroupedStakingEvents(UserTransactionType.Withdraw, stakingEvents, ctx)
    const wfuGroupedStakingEvents = await getGroupedStakingEvents(UserTransactionType.WithdrawFromUnregistered, stakingEvents, ctx)
    await ctx.store.insert(
        bnsGroupedStakingEvents
            .concat(unuGroupedStakingEvents)
            .concat(ntGroupedStakingEvents)
            .concat(wGroupedStakingEvents)
            .concat(wfuGroupedStakingEvents)
    )
    await ctx.store.insert(stakingEvents)
})

async function getGroupedStakingEvents(txType: UserTransactionType, stakingEvents: StakingEvent[], ctx: ProcessorContext<Store>): Promise<GroupedStakingEvent[]> {
    const events = stakingEvents.filter(e => e.transaction===txType)
    if (events.length === 0) {
        return []
    }

    let ungroupedTimestampsFrom = getFirstTimestampOfTheDay(Number(events[0].timestamp))
    let ungroupedStakingEvents = events

    let lastGroupedStakingEvent = await ctx.store.find(GroupedStakingEvent, {order: {timestamp: 'DESC'}, take: 1, where: {transaction: txType}})
    if (lastGroupedStakingEvent.length>0) {
        ungroupedTimestampsFrom = getFirstTimestampOfTheNextDay(Number(lastGroupedStakingEvent[0].timestamp))
        let savedUngroupedStakingEvents = await ctx.store.findBy(StakingEvent, {transaction: Equal(txType), timestamp: MoreThanOrEqual(BigInt(ungroupedTimestampsFrom))})
        ungroupedStakingEvents = savedUngroupedStakingEvents.concat(events)
        // console.log(`${txType}: Got ${savedUngroupedStakingEvents.length} saved staking events from the database - total length is ${ungroupedStakingEvents.length}`)
    }

    const out: GroupedStakingEvent[] = []

    let currentDay = getDayIdentifier(ungroupedTimestampsFrom)
    let amount = 0n
    for (let usevent of ungroupedStakingEvents) {
        let newCurrentDay = getDayIdentifier(Number(usevent.timestamp))
        if (newCurrentDay == currentDay) {
            amount += usevent.amount
        }
        else {
            while (currentDay !== newCurrentDay) {
                // console.log(`${txType}: Adding GSE for the day starting at ${new Date(ungroupedTimestampsFrom)}`)
                out.push(new GroupedStakingEvent({
                    id: `${ungroupedTimestampsFrom}-${txType}`,
                    transaction: txType,
                    amount,
                    timestamp: BigInt(ungroupedTimestampsFrom)
                }))
                ungroupedTimestampsFrom = getFirstTimestampOfTheNextDay(ungroupedTimestampsFrom)
                currentDay = getDayIdentifier(ungroupedTimestampsFrom)
                amount = currentDay===newCurrentDay ? usevent.amount : 0n
            }
        }
    }
    return out
}
