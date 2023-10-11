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
        archive: 'https://astar.archive.subsquid.io/graphql'
    })
    .addEvent({
        name: [events.balances.transfer.name]
    })
    .addEvent({
        name: [events.dappsStaking.bondAndStake.name]
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
                if (events.balances.transfer.v1.is(event)) {
                    let [from, to, amount] = events.balances.transfer.v1.decode(event)
                    rec = {from, to, amount}
                } else {
                    rec = events.balances.transfer.v3.decode(event)
                }
                transfers.push(new Transfer({
                    id: event.id,
                    from: ss58.codec('astar').encode(rec.from),
                    to: ss58.codec('astar').encode(rec.to),
                    amount: BigDecimal(rec.amount, 12),
                    timestamp: BigInt(block.header.timestamp ?? 0),
                }))
            }
        }
    }

    await ctx.store.insert(transfers)
})
