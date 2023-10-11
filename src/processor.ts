import {BigDecimal} from '@subsquid/big-decimal'
import * as ss58 from '@subsquid/ss58'
import {SubstrateBatchProcessor} from '@subsquid/substrate-processor'
import {Bytes} from '@subsquid/substrate-runtime'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import {Transfer} from './model'
import {events} from './types'

export const processor = new SubstrateBatchProcessor()
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
