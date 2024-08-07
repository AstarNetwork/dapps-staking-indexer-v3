import { Store } from "@subsquid/typeorm-store";
import {
  Stake,
  StakesPerDapAndPeriod,
  StakesPerStakerAndPeriod,
} from "../model";
import { Event, ProcessorContext } from "../processor";
import { events } from "../types";
import { Entities, getContractAddress, getSs58Address } from "../utils";

export function getStake(event: Event, period: number): Stake {
  const amount = BigInt(event.args.amount);
  const stakeAmount =
    event.name === events.dappStaking.stake.name ? amount : -amount;

  return new Stake({
    id: event.id,
    dappAddress: getContractAddress(event.args.smartContract),
    stakerAddress: getSs58Address(event.args.account),
    blockNumber: event.block.height,
    timestamp: BigInt(event.block.timestamp ?? 0),
    amount: stakeAmount,
    period,
  });
}

export async function aggregateStakesPerDapp(
  ctx: ProcessorContext<Store>,
  entities: Entities,
  dappAddress: string,
  stakeAmount: bigint,
  rewardAmount: bigint,
  period: number
) {
  // Check if the entity is already in memory.
  const id = `${dappAddress}_${period}`;
  let entity = entities.StakesPerDapAndPeriodToUpsert.find((x) => x.id === id);
  let isEntityInMemory = true;

  if (entity === undefined) {
    // If not in memory, load from database.
    isEntityInMemory = false;
    entity = await ctx.store.get(StakesPerDapAndPeriod, id);
  }

  if (entity === undefined) {
    // If not in database, create a new entity.
    entities.StakesPerDapAndPeriodToUpsert.push(
      new StakesPerDapAndPeriod({
        id,
        dappAddress,
        period,
        stakeAmount,
        rewardAmount,
      })
    );
  } else {
    entity.stakeAmount += stakeAmount;
    entity.rewardAmount += rewardAmount;

    if (!isEntityInMemory) {
      entities.StakesPerDapAndPeriodToUpsert.push(entity);
    }

    return entity;
  }
}

export async function aggregateStakesPerStaker(
  ctx: ProcessorContext<Store>,
  entities: Entities,
  stakerAddress: string,
  stakeAmount: bigint,
  stakerRewardAmount: bigint,
  bonusRewardAmount: bigint,
  period: number
) {
  // Check if the entity is already in memory.
  const id = `${stakerAddress}_${period}`;
  let entity = entities.StakesPerStakerAndPeriodToUpsert.find(
    (x) => x.id === id
  );
  let isEntityInMemory = true;

  if (entity === undefined) {
    // If not in memory, load from database.
    isEntityInMemory = false;
    entity = await ctx.store.get(StakesPerStakerAndPeriod, id);
  }

  if (entity === undefined) {
    // If not in database, create a new entity.
    entities.StakesPerStakerAndPeriodToUpsert.push(
      new StakesPerStakerAndPeriod({
        id,
        stakerAddress,
        period,
        stakeAmount,
        stakerRewardAmount,
        bonusRewardAmount,
      })
    );
  } else {
    entity.stakeAmount += stakeAmount;
    entity.stakerRewardAmount += stakerRewardAmount;
    entity.bonusRewardAmount += bonusRewardAmount;

    if (!isEntityInMemory) {
      entities.StakesPerStakerAndPeriodToUpsert.push(entity);
    }

    return entity;
  }
}
