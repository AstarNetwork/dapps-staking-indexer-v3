import assert from "assert";
import * as ss58 from "@subsquid/ss58";
import { TypeormDatabase, Store } from "@subsquid/typeorm-store";
import { Equal, MoreThanOrEqual } from "typeorm";
import {
  GroupedStakingEvent,
  StakingEvent,
  UserTransactionType,
} from "./model";
import { events } from "./types";
import { processor, ProcessorContext } from "./processor";
import {
  Entities,
  getDayIdentifier,
  getFirstTimestampOfTheNextDay,
  getFirstTimestampOfTheDay,
} from "./utils";
import {
  updateOwner,
  registerDapp,
  unregisterDapp,
  updateBeneficiary,
  handleTvl,
  handleStakersCount,
  updateDapp,
} from "./mapping";
import {
  aggregateStakesPerDapp,
  aggregateStakesPerStaker,
  getStake,
} from "./mapping/stake";
import { handleSubperiod } from "./mapping/subperiod";
import { handleRewards } from "./mapping/rewards";
import { handleStakersCountAggregated } from "./mapping/stakersCount";
import { getPeriodForBlock } from "./mapping/protocolState";
import { handleRewardsPeriodAggregation } from "./mapping/periodAggregation";
import { insertBurnEvent } from "./mapping/burn";

// supportHotBlocks: true is actually the default, adding it so that it's obvious how to disable it
processor.run(new TypeormDatabase({ supportHotBlocks: true }), async (ctx) => {
  const entities = new Entities();
  await handleEvents(ctx, entities);

  const bnsGroupedStakingEvents = await getGroupedStakingEvents(
    UserTransactionType.BondAndStake,
    entities.stakingEvent,
    ctx
  );
  const unuGroupedStakingEvents = await getGroupedStakingEvents(
    UserTransactionType.UnbondAndUnstake,
    entities.stakingEvent,
    ctx
  );
  const ntGroupedStakingEvents = await getGroupedStakingEvents(
    UserTransactionType.NominationTransfer,
    entities.stakingEvent,
    ctx
  );
  const wGroupedStakingEvents = await getGroupedStakingEvents(
    UserTransactionType.Withdraw,
    entities.stakingEvent,
    ctx
  );
  const wfuGroupedStakingEvents = await getGroupedStakingEvents(
    UserTransactionType.WithdrawFromUnregistered,
    entities.stakingEvent,
    ctx
  );

  await ctx.store.insert(
    bnsGroupedStakingEvents
      .concat(unuGroupedStakingEvents)
      .concat(ntGroupedStakingEvents)
      .concat(wGroupedStakingEvents)
      .concat(wfuGroupedStakingEvents)
  );
  await ctx.store.insert(entities.RewardsToInsert);
  await ctx.store.upsert(entities.RewardsAggregatedToUpsert);
  await ctx.store.insert(entities.stakingEvent);
  await ctx.store.insert(entities.DappsToInsert);
  await ctx.store.upsert(entities.DappsToUpdate);
  await ctx.store.upsert(entities.TvlToUpsert);
  await ctx.store.upsert(entities.StakersToUpsert);
  await ctx.store.insert(entities.StakersCountToInsert);
  await ctx.store.upsert(entities.StakersCountToUpdate);
  await ctx.store.upsert(entities.StakersCountAggregatedDailyToUpsert);
  await ctx.store.insert(entities.UniqueStakerAddressToInsert);
  await ctx.store.upsert(entities.UniqueLockerAddressToUpsert);
  await ctx.store.insert(entities.StakesToInsert);
  await ctx.store.upsert(entities.StakesToUpdate);
  await ctx.store.insert(entities.SubperiodsToInsert);
  await ctx.store.upsert(entities.StakesPerDapAndPeriodToUpsert);
  await ctx.store.upsert(entities.StakesPerStakerAndPeriodToUpsert);
  await ctx.store.insert(entities.BurnEventsToInsert);
});

async function handleEvents(ctx: ProcessorContext<Store>, entities: Entities) {
  for (let block of ctx.blocks) {
    for (let event of block.events) {
      let decoded;
      ctx.log.info(
        `Processing event: ${event.name}, block ${block.header.height}`
      );

      switch (event.name) {
        case events.dappsStaking.bondAndStake.name:
          if (events.dappsStaking.bondAndStake.v1.is(event)) {
            let [account, contract, amount] =
              events.dappsStaking.bondAndStake.v1.decode(event);
            decoded = {
              account,
              contractAddr:
                contract.__kind === "Evm"
                  ? contract.value
                  : ss58.encode({ prefix: 5, bytes: contract.value }),
              amount,
            };
          } else {
            ctx.log.error(`Unknown runtime version for a BondAndState event`);
            continue;
          }

          entities.stakingEvent.push(
            new StakingEvent({
              id: event.id,
              userAddress: ss58.encode({ prefix: 5, bytes: decoded.account }),
              transaction: UserTransactionType.BondAndStake,
              contractAddress: decoded.contractAddr,
              amount: decoded.amount,
              timestamp: BigInt(block.header.timestamp || 0),
              blockNumber: BigInt(block.header.height),
            })
          );

          break;

        case events.dappsStaking.nominationTransfer.name:
          if (events.dappsStaking.nominationTransfer.v1.is(event)) {
            let [account, origin, amount, target] =
              events.dappsStaking.nominationTransfer.v1.decode(event);
            decoded = {
              account,
              originAddr:
                origin.__kind === "Evm"
                  ? origin.value
                  : ss58.encode({ prefix: 5, bytes: origin.value }),
              amount,
              targetAddr:
                target.__kind === "Evm"
                  ? target.value
                  : ss58.encode({ prefix: 5, bytes: target.value }),
            };
          } else {
            ctx.log.error(
              `Unknown runtime version for a NominationTransfer event`
            );
            continue;
          }

          entities.stakingEvent.push(
            new StakingEvent({
              id: event.id,
              userAddress: ss58.encode({ prefix: 5, bytes: decoded.account }),
              transaction: UserTransactionType.NominationTransfer,
              contractAddress: decoded.targetAddr, // targetAddr as contractAddress?
              amount: decoded.amount,
              timestamp: BigInt(block.header.timestamp || 0),
              blockNumber: BigInt(block.header.height),
            })
          );

          break;

        case events.dappsStaking.withdrawn.name:
          if (events.dappsStaking.withdrawn.v1.is(event)) {
            let [account, amount] =
              events.dappsStaking.withdrawn.v1.decode(event);
            decoded = {
              account,
              amount,
            };
          } else {
            ctx.log.error(`Unknown runtime version for a Withdrawn event`);
            continue;
          }

          entities.stakingEvent.push(
            new StakingEvent({
              id: event.id,
              userAddress: ss58.encode({ prefix: 5, bytes: decoded.account }),
              transaction: UserTransactionType.Withdraw,
              amount: decoded.amount,
              timestamp: BigInt(block.header.timestamp || 0),
              blockNumber: BigInt(block.header.height),
            })
          );

          break;

        case events.dappsStaking.withdrawFromUnregistered.name:
          if (events.dappsStaking.withdrawFromUnregistered.v1.is(event)) {
            let [account, contract, amount] =
              events.dappsStaking.withdrawFromUnregistered.v1.decode(event);
            decoded = {
              account,
              contractAddr:
                contract.__kind === "Evm"
                  ? contract.value
                  : ss58.encode({ prefix: 5, bytes: contract.value }),
              amount,
            };
          } else {
            ctx.log.error(
              `Unknown runtime version for a WithdrawFromUnregistered event`
            );
            continue;
          }

          entities.stakingEvent.push(
            new StakingEvent({
              id: event.id,
              userAddress: ss58.encode({ prefix: 5, bytes: decoded.account }),
              transaction: UserTransactionType.WithdrawFromUnregistered,
              contractAddress: decoded.contractAddr,
              amount: decoded.amount,
              timestamp: BigInt(block.header.timestamp || 0),
              blockNumber: BigInt(block.header.height),
            })
          );

          break;

        case events.dappsStaking.unbondAndUnstake.name:
          if (events.dappsStaking.unbondAndUnstake.v1.is(event)) {
            let [account, contract, amount] =
              events.dappsStaking.unbondAndUnstake.v1.decode(event);
            decoded = {
              account,
              contractAddr:
                contract.__kind === "Evm"
                  ? contract.value
                  : ss58.encode({ prefix: 5, bytes: contract.value }),
              amount,
            };
          } else {
            ctx.log.error(
              `Unknown runtime version for an UnbondAndUnstake event`
            );
            continue;
          }

          entities.stakingEvent.push(
            new StakingEvent({
              id: event.id,
              userAddress: ss58.encode({ prefix: 5, bytes: decoded.account }),
              transaction: UserTransactionType.UnbondAndUnstake,
              contractAddress: decoded.contractAddr,
              amount: decoded.amount,
              timestamp: BigInt(block.header.timestamp || 0),
              blockNumber: BigInt(block.header.height),
            })
          );

          break;

        case events.dappStaking.dAppRegistered.name:
          entities.DappsToInsert.push(registerDapp(event));
          break;
        case events.dappStaking.dAppUnregistered.name:
          const unregisteredDapp = await unregisterDapp(ctx, event);
          unregisteredDapp && updateDapp(unregisteredDapp, entities);
          break;
        case events.dappStaking.dAppOwnerChanged.name:
          const ownerChangedDapp = await updateOwner(ctx, event);
          ownerChangedDapp && updateDapp(ownerChangedDapp, entities);
          break;
        case events.dappStaking.dAppRewardDestinationUpdated.name:
          const beneficiaryChangedDapp = await updateBeneficiary(ctx, event);
          beneficiaryChangedDapp &&
            updateDapp(beneficiaryChangedDapp, entities);
          break;
        case events.dappStaking.locked.name:
        case events.dappStaking.unlocking.name:
        // case events.dappStaking.claimedUnlocked.name:
        case events.dappStaking.relock.name:
          await handleTvl(ctx, event, entities);
          break;
        case events.dappStaking.stake.name:
        case events.dappStaking.unstake.name:
        case events.dappStaking.unstakeFromUnregistered.name:
          const stake = getStake(event);
          entities.StakesToInsert.push(stake);
          const dapp = await handleStakersCount(ctx, stake, entities, event);

          if (dapp) updateDapp(dapp, entities);

          const period = getPeriodForBlock(block.header.height);
          await aggregateStakesPerDapp(
            ctx,
            entities,
            stake.dappAddress,
            stake.amount,
            BigInt(0),
            period
          );

          await aggregateStakesPerStaker(
            ctx,
            entities,
            stake.stakerAddress,
            stake.amount,
            BigInt(0),
            BigInt(0),
            period
          );

          break;
        case events.dappStaking.newSubperiod.name:
          await handleSubperiod(ctx, event, entities);
          break;
        case events.dappStaking.reward.name:
        case events.dappStaking.bonusReward.name:
        case events.dappStaking.dAppReward.name:
          await handleRewards(event, entities, ctx);
          await handleRewardsPeriodAggregation(event, entities, ctx);

          break;
        case events.balances.burned.name:
          insertBurnEvent(entities, event, ctx);
          break;
        default:
          ctx.log.warn(`Unhandled event: ${event.name}`);
          continue;
      }
    }
  }
  await handleStakersCountAggregated(ctx, entities, ctx.blocks[0].header);
}

async function getGroupedStakingEvents(
  txType: UserTransactionType,
  stakingEvents: StakingEvent[],
  ctx: ProcessorContext<Store>
): Promise<GroupedStakingEvent[]> {
  const events = stakingEvents.filter((e) => e.transaction === txType);
  if (events.length === 0) {
    return [];
  }

  let ungroupedTimestampsFrom = getFirstTimestampOfTheDay(
    Number(events[0].timestamp)
  );
  let ungroupedStakingEvents = events;

  let lastGroupedStakingEvent = await ctx.store.find(GroupedStakingEvent, {
    order: { timestamp: "DESC" },
    take: 1,
    where: { transaction: txType },
  });
  if (lastGroupedStakingEvent.length > 0) {
    ungroupedTimestampsFrom = getFirstTimestampOfTheNextDay(
      Number(lastGroupedStakingEvent[0].timestamp)
    );
    let savedUngroupedStakingEvents = await ctx.store.findBy(StakingEvent, {
      transaction: Equal(txType),
      timestamp: MoreThanOrEqual(BigInt(ungroupedTimestampsFrom)),
    });
    ungroupedStakingEvents = savedUngroupedStakingEvents.concat(events);
    // console.log(`${txType}: Got ${savedUngroupedStakingEvents.length} saved staking events from the database - total length is ${ungroupedStakingEvents.length}`)
  }

  const out: GroupedStakingEvent[] = [];

  let currentDay = getDayIdentifier(ungroupedTimestampsFrom);
  let amount = 0n;
  for (let usevent of ungroupedStakingEvents) {
    let newCurrentDay = getDayIdentifier(Number(usevent.timestamp));
    if (newCurrentDay == currentDay) {
      amount += usevent.amount;
    } else {
      while (currentDay !== newCurrentDay) {
        // console.log(`${txType}: Adding GSE for the day starting at ${new Date(ungroupedTimestampsFrom)}`)
        out.push(
          new GroupedStakingEvent({
            id: `${ungroupedTimestampsFrom}-${txType}`,
            transaction: txType,
            amount,
            timestamp: BigInt(ungroupedTimestampsFrom),
          })
        );
        ungroupedTimestampsFrom = getFirstTimestampOfTheNextDay(
          ungroupedTimestampsFrom
        );
        currentDay = getDayIdentifier(ungroupedTimestampsFrom);
        amount = currentDay === newCurrentDay ? usevent.amount : 0n;
      }
    }
  }
  return out;
}
