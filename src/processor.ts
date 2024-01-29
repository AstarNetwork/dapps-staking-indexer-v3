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

let CHAIN = "shiden";

let chainURL;
let blockRange;
switch (CHAIN) {
  case "astar":
    blockRange = { from: 4_342_300 };
    chainURL = "wss://astar-rpc.dwellir.com";
    break;
  case "shiden":
    blockRange = { from: 5_820_969 };
    chainURL = "wss://shiden-rpc.dwellir.com";
    break;
  case "shibuya":
    blockRange = { from: 5_335_615 };
    chainURL = "wss://shibuya-rpc.dwellir.com";
    break;
}

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
