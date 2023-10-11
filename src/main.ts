import {BigDecimal} from '@subsquid/big-decimal'
import * as ss58 from '@subsquid/ss58'
import {Bytes} from '@subsquid/substrate-runtime'
import {TypeormDatabase} from '@subsquid/typeorm-store'

import {Transfer} from './model'
import {events} from './types'
import {processor} from './processor'

// supportHotBlocks: true is actually the default, adding it so that it's obvious how to disable it
processor.run(new TypeormDatabase({supportHotBlocks: true}), async ctx => {

    // let transfers: Transfer[] = []

    for (let block of ctx.blocks) {
        for (let event of block.events) {
            if (event.name == events.dappsStaking.bondAndStake.name) {
                let decoded: {account: string, contractAddr: string, amount: bigint}
                if (events.dappsStaking.bondAndStake.v4.is(event)) {
                    let [account, contract, amount] = events.dappsStaking.bondAndStake.v4.decode(event)
                    decoded = {
                        account,
                        contractAddr: contract.value, // regardless of whether if it's WASM or EVM, use contract._kind to process these cases differently
                        amount
                    }
                } else {
                    ctx.log.error(`Unknown runtime version for a BondAndState event`)
                    continue
                }
                console.log('BondAndStake', decoded) // replace with event processing code
            }
            else if (event.name == events.dappsStaking.nominationTransfer.name) {
                let decoded: {account: string, originAddr: string, amount: bigint, targetAddr: string}
                if (events.dappsStaking.nominationTransfer.v17.is(event)) {
                    let [account, origin, amount, target] = events.dappsStaking.nominationTransfer.v17.decode(event)
                    decoded = {
                        account,
                        originAddr: origin.value,
                        amount,
                        targetAddr: origin.value
                    }
                } else {
                    ctx.log.error(`Unknown runtime version for a NominationTransfer event`)
                    continue
                }
                console.log('NominationTransfer', decoded) // replace with event processing code
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
                    ctx.log.error(`Unknown runtime version for an UnboundAndUnstake event`)
                    continue
                }
                console.log('UnboundAndUnstake', decoded) // replace with event processing code
            }
        }
    }

    // await ctx.store.insert(transfers)
})
