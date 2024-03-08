import { TypeormDatabase, Store } from "@subsquid/typeorm-store";
import { events } from "./types";
import { processor, ProcessorContext } from "./processor";
import { Entities } from "./utils";
import {
  updateOwner,
  registerDapp,
  unregisterDapp,
  updateBeneficiary,
  handleTvl,
  handleStakersCount,
} from "./mapping";
import { getStake } from "./mapping/stake";
import { handleSubperiod } from "./mapping/subperiod";
import { handleRewards } from "./mapping/rewards";
import { handleStakersCountAggregated } from "./mapping/stakersCount";

// supportHotBlocks: true is actually the default, adding it so that it's obvious how to disable it
processor.run(
  new TypeormDatabase({ supportHotBlocks: true, stateSchema: "processor" }),
  async (ctx) => {
    const entities = new Entities();
    await handleEvents(ctx, entities);

    await ctx.store.insert(entities.RewardsToInsert);
    await ctx.store.upsert(entities.RewardsAggregatedToUpsert);
    await ctx.store.insert(entities.stakingEvent);
    await ctx.store.insert(entities.DappsToInsert);
    await ctx.store.upsert(entities.DappsToUpdate);
    await ctx.store.insert(entities.TvlToInsert);
    await ctx.store.upsert(entities.TvlToUpdate);
    await ctx.store.upsert(entities.StakersToUpsert);
    await ctx.store.insert(entities.StakersCountToInsert);
    await ctx.store.upsert(entities.StakersCountToUpdate);
    await ctx.store.upsert(entities.StakersCountAggregatedDailyToUpsert);
    await ctx.store.insert(entities.UniqueStakerAddressToInsert);
    await ctx.store.upsert(entities.UniqueLockerAddressToUpsert);
    await ctx.store.insert(entities.StakesToInsert);
    await ctx.store.upsert(entities.StakesToUpdate);
    await ctx.store.insert(entities.SubperiodsToInsert);
  }
);

async function handleEvents(
  ctx: ProcessorContext<Store>,
  entities: Entities
) {
  for (let block of ctx.blocks) {
    for (let event of block.events) {
      ctx.log.info(`Processing event: ${event.name}`);
      switch (event.name) {
        case events.dappStaking.dAppRegistered.name:
          entities.DappsToInsert.push(registerDapp(event));
          break;
        case events.dappStaking.dAppUnregistered.name:
          const unregisteredDapp = await unregisterDapp(ctx, event);
          unregisteredDapp && entities.DappsToUpdate.push(unregisteredDapp);
          break;
        case events.dappStaking.dAppOwnerChanged.name:
          const ownerChangedDapp = await updateOwner(ctx, event);
          ownerChangedDapp && entities.DappsToUpdate.push(ownerChangedDapp);
          break;
        case events.dappStaking.dAppRewardDestinationUpdated.name:
          const beneficiaryChangedDapp = await updateBeneficiary(ctx, event);
          beneficiaryChangedDapp &&
            entities.DappsToUpdate.push(beneficiaryChangedDapp);
          break;
        case events.dappStaking.locked.name:
        case events.dappStaking.unlocking.name:
        case events.dappStaking.relock.name:
          await handleTvl(ctx, event, entities);
          break;
        case events.dappStaking.stake.name:
        case events.dappStaking.unstake.name:
        case events.dappStaking.unstakeFromUnregistered.name:
          const stake = getStake(event);
          entities.StakesToInsert.push(stake);
          const dapp = await handleStakersCount(ctx, stake, entities, event);
          const index = entities.DappsToUpdate.findIndex(
            (d) => d.id === dapp?.id
          );
          // If found, remove it from the array
          if (index !== -1) {
            entities.DappsToUpdate.splice(index, 1);
          }
          dapp && entities.DappsToUpdate.push(dapp);
          break;
        case events.dappStaking.newSubperiod.name:
          await handleSubperiod(ctx, event, entities);
          break;
        case events.dappStaking.reward.name:
        case events.dappStaking.bonusReward.name:
        case events.dappStaking.dAppReward.name:
          await handleRewards(event, entities, ctx);
          break;
        default:
          ctx.log.warn(`Unhandled event: ${event.name}`);
          continue;
      }
    }
  }
  await handleStakersCountAggregated(ctx, entities, ctx.blocks[0].header);
}
