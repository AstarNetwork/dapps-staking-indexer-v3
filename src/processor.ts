import {
  BlockHeader,
  SubstrateBatchProcessor,
  SubstrateBatchProcessorFields,
  DataHandlerContext,
  Event as _Event,
  Call as _Call,
  Extrinsic as _Extrinsic,
} from "@subsquid/substrate-processor";
import { assertNotNull } from "@subsquid/util-internal";
import { lookupArchive } from "@subsquid/archive-registry";
import { events } from "./types";

// Extract command line arguments excluding the first two elements
const args = process.argv.slice(2);

// Function to determine CHAIN based on command line arguments
function determineChain(args: string[]) {
    for (let arg of args) {
        if (arg.includes('astar')) {
            return 'astar';
        } else if (arg.includes('shiden')) {
            return 'shiden';
        }
    }
    return 'shibuya'; // Default value if no specific chain is found
}

const network = determineChain(args);

// Object to map CHAIN to its URL and blockRange
const chainConfig = {
  astar: {
    blockRange: { from: 4_342_300 },
    chainURL: "wss://astar-rpc.dwellir.com",
  },
  shiden: {
    blockRange: { from: 5_820_969 },
    chainURL: "wss://shiden-rpc.dwellir.com",
  },
  shibuya: {
    blockRange: { from: 5_335_615 },
    chainURL: "wss://shibuya-rpc.dwellir.com",
  },
};

// Setting chainURL and blockRange based on the CHAIN variable
let { chainURL, blockRange } = chainConfig[network];
console.log(`Chain URL: ${chainURL}`);

export const processor = new SubstrateBatchProcessor()
  .setDataSource({
    chain: chainURL!,
  })
  .addEvent({
    name: [
      events.dappsStaking.withdrawn.name,
      events.dappsStaking.withdrawFromUnregistered.name,
      events.dappsStaking.bondAndStake.name,
      events.dappsStaking.nominationTransfer.name,
      events.dappsStaking.unbondAndUnstake.name,
      events.dappStaking.dAppRegistered.name,
      events.dappStaking.dAppUnregistered.name,
      events.dappStaking.dAppOwnerChanged.name,
      events.dappStaking.dAppRewardDestinationUpdated.name,
      events.dappStaking.locked.name,
      events.dappStaking.unlocking.name,
      // events.dappStaking.claimedUnlocked.name,
      events.dappStaking.relock.name,
      events.dappStaking.stake.name,
      events.dappStaking.unstake.name,
      events.dappStaking.unstakeFromUnregistered.name,
      events.dappStaking.newSubperiod.name,
      events.dappStaking.reward.name,
      events.dappStaking.bonusReward.name,
      events.dappStaking.dAppReward.name,
    ],
  })
  .setFields({
    block: {
      timestamp: true,
    },
  })
  .setBlockRange(blockRange);

export type Fields = SubstrateBatchProcessorFields<typeof processor>;
export type Block = BlockHeader<Fields>;
export type Event = _Event<Fields>;
export type Call = _Call<Fields>;
export type Extrinsic = _Extrinsic<Fields>;
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>;
