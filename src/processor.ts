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
import { IS_SHIBUYA } from "./mapping/protocolState";

const blockRange = { from: parseInt(process.env.BLOCK_RANGE!, 10) };
console.log(`Block Range: ${blockRange.from}`);
// See why shibuya archive is throwing an error.
const archive =
  process.env.ARCHIVE !== "" && !IS_SHIBUYA
    ? lookupArchive(process.env.ARCHIVE!, {
        type: "Substrate",
        release: "ArrowSquid",
      })
    : undefined;
console.log(`Archive: ${archive}`);
// const rpcSubstrateHttp = `RPC_${archive!.toUpperCase()}_SUBSTRATE_HTTP`;
const chain = process.env.RPC_ENDPOINT; // process.env[rpcSubstrateHttp] || process.env.RPC_ENDPOINT;
console.log(`Chain URL: ${chain}`);

export const processor = new SubstrateBatchProcessor()
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
      events.balances.burned.name,
    ],
  })
  .setFields({
    block: {
      timestamp: true,
    },
  })
  .setFinalityConfirmation(20)
  .setBlockRange(blockRange);

export type Fields = SubstrateBatchProcessorFields<typeof processor>;
export type Block = BlockHeader<Fields>;
export type Event = _Event<Fields>;
export type Call = _Call<Fields>;
export type Extrinsic = _Extrinsic<Fields>;
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>;
