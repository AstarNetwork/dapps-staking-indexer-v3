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

const blockRangeV2 = {
  from: parseInt(process.env.BLOCK_RANGE!, 10),
  to: parseInt(process.env.BLOCK_RANGE_TO!, 10),
};
const blockRangeV3 = {
  from: parseInt(process.env.BLOCK_RANGE_TO!, 10),
};
console.log(`Block Range V2: ${blockRangeV2.from}, ${blockRangeV2.to}`);
console.log(`Block Range V3: ${blockRangeV3.from}`);
const archive =
  process.env.ARCHIVE != ""
    ? lookupArchive(process.env.ARCHIVE!, {
        type: "Substrate",
        release: "ArrowSquid",
      })
    : undefined;
console.log(`Archive: ${archive}`);
// const rpcSubstrateHttp = `RPC_${archive!.toUpperCase()}_SUBSTRATE_HTTP`;
const chain = process.env.RPC_ENDPOINT; // process.env[rpcSubstrateHttp] || process.env.RPC_ENDPOINT;
console.log(`Chain URL: ${chain}`);

export const processorV2 = new SubstrateBatchProcessor()
  .setDataSource({
    chain: assertNotNull(chain),
    archive: archive,
  })
  .addEvent({
    name: [
      events.dappsStaking.withdrawn.name,
      events.dappsStaking.withdrawFromUnregistered.name,
      events.dappsStaking.bondAndStake.name,
      events.dappsStaking.nominationTransfer.name,
      events.dappsStaking.unbondAndUnstake.name,
    ],
  })
  .setFields({
    block: {
      timestamp: true,
    },
  })
  .setBlockRange(blockRangeV2)
  .setPrometheusPort("3000");

export const processorV3 = new SubstrateBatchProcessor()
  .setDataSource({
    chain: assertNotNull(chain),
    // archive: archive,
  })
  .addEvent({
    name: [
      events.dappStaking.dAppRegistered.name,
      events.dappStaking.dAppUnregistered.name,
      events.dappStaking.dAppOwnerChanged.name,
      events.dappStaking.dAppRewardDestinationUpdated.name,
      events.dappStaking.locked.name,
      events.dappStaking.unlocking.name,
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
  .setBlockRange(blockRangeV3)
  .setPrometheusPort("3001");

export type Fields = SubstrateBatchProcessorFields<typeof processorV2>;
export type Block = BlockHeader<Fields>;
export type Event = _Event<Fields>;
export type Call = _Call<Fields>;
export type Extrinsic = _Extrinsic<Fields>;
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>;
