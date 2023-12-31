import {
    SubstrateBatchProcessor,
    SubstrateBatchProcessorFields,
    DataHandlerContext
} from '@subsquid/substrate-processor'
import {lookupArchive} from '@subsquid/archive-registry'

import {events} from './types'

export const processor = new SubstrateBatchProcessor()
    .setDataSource({
        chain: 'https://astar.api.onfinality.io/public',
        archive: lookupArchive('astar', {type: 'Substrate', release: 'ArrowSquid'})
    })
    .addEvent({
        name: [
            events.dappsStaking.withdrawn.name,
            events.dappsStaking.withdrawFromUnregistered.name,
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

export type Fields = SubstrateBatchProcessorFields<typeof processor>
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>
