import {BigDecimal} from '@subsquid/big-decimal'
import * as ss58 from '@subsquid/ss58'
import {SubstrateBatchProcessor} from '@subsquid/substrate-processor'
import {Bytes} from '@subsquid/substrate-runtime'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import {Transfer} from './model'
import {events} from './types'


const processor = new SubstrateBatchProcessor()
    .setDataSource({
        chain: 'https://astar-rpc.dwellir.com',
        archive: 'https://v2.archive.subsquid.io/network/astar'
    })
    .addEvent({
        name: [events.balances.transfer.name]
    })
    .addEvent({
        name: [events.DappsStaking.BondAndStake.name]
    })
    .setFields({
        block: {
            timestamp: true
        }
    })
    .setBlockRange({from: 4_342_300})


processor.run(new TypeormDatabase(), async ctx => {
    let transfers: Transfer[] = []

    for (let block of ctx.blocks) {
        for (let event of block.events) {
            if (event.name == events.balances.transfer.name) {
                let rec: {from: Bytes, to: Bytes, amount: bigint}
                if (events.balances.transfer.v1020.is(event)) {
                    let [from, to, amount, fee] = events.balances.transfer.v1020.decode(event)
                    rec = {from, to, amount}
                } else if (events.balances.transfer.v1050.is(event)) {
                    let [from, to, amount] = events.balances.transfer.v1050.decode(event)
                    rec = {from, to, amount}
                } else {
                    rec = events.balances.transfer.v9130.decode(event)
                }
                transfers.push(new Transfer({
                    id: event.id,
                    from: ss58.codec('kusama').encode(rec.from),
                    to: ss58.codec('kusama').encode(rec.to),
                    amount: BigDecimal(rec.amount, 12),
                    timestamp: BigInt(block.header.timestamp ?? 0),
                }))
            }
        }
    }

    await ctx.store.insert(transfers)
})
