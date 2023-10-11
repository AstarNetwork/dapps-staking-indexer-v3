import {SubstrateBatchProcessor} from '@subsquid/substrate-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import {lookupArchive} from '@subsquid/archive-registry'

export const processor = new SubstrateBatchProcessor()
    .setDataSource({
        chain: 'https://astar-rpc.dwellir.com',
        archive: lookupArchive('astar', {type: 'Substrate', release: 'ArrowSquid'})
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
