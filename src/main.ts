import {BigDecimal} from '@subsquid/big-decimal'
import * as ss58 from '@subsquid/ss58'
import {Bytes} from '@subsquid/substrate-runtime'
import {TypeormDatabase} from '@subsquid/typeorm-store'

import {Transfer} from './model'
import {events} from './types'
import {processor} from './processor'

// supportHotBlocks: true is actually the default, adding it so that it's obvious how to disable it
processor.run(new TypeormDatabase({supportHotBlocks: true}), async ctx => {
//    let transfers: Transfer[] = []

    for (let block of ctx.blocks) {
        for (let event of block.events) {
            if (event.name == events.dappsStaking.bondAndStake.name) {
                let bondAndStake: {account: string, contractAddr: string, amount: bigint}
                if (events.dappsStaking.bondAndStake.v4.is(event)) {
                    let [account, contract, amount] = events.dappsStaking.bondAndStake.v4.decode(event)
                    bondAndStake = {
                        account,
                        contractAddr: contract.value, // regardless of whether if it's WASM or EVM, use contract._kind to process these cases differently
                        amount
                    }
                } else {
                    ctx.log.error(`Unknown runtime version for a BondAndState event`)
                    continue
                }
                console.log(bondAndStake) // replace with event processing code
            }
        }
    }

//    await ctx.store.insert(transfers)
})
