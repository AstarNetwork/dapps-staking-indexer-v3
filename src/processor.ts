import {SubstrateBatchProcessor} from '@subsquid/substrate-processor'
import {lookupArchive} from '@subsquid/archive-registry'

import {events} from './types'

export const processor = new SubstrateBatchProcessor()
    .setDataSource({
        chain: 'https://astar-rpc.dwellir.com',
        archive: lookupArchive('astar', {type: 'Substrate', release: 'ArrowSquid'})
    })
    .addEvent({
        name: [
            events.dappsStaking.bondAndStake.name,
            events.dappsStaking.nominationTransfer.name,
            events.dappsStaking.unbondAndUnstake.name
        ]
    })
    .setFields({
        block: {
            timestamp: true
        }
    })
    .setBlockRange({from: 4_342_300})
