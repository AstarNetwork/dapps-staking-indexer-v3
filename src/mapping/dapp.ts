import { Store } from "@subsquid/typeorm-store";
import {
  Dapp,
  DappState,
  DappAggregatedDaily,
  Stake,
  Stakers,
  Subperiod,
  SubperiodType,
  UniqueStakerAddress,
} from "../model";
import { Event, ProcessorContext } from "../processor";
import {
  Entities,
  getFirstTimestampOfTheDay,
  getContractAddress,
  getSs58Address,
} from "../utils";
import { SmartContract } from "../types/v1";
import { IsNull } from "typeorm";

export function registerDapp(event: Event): Dapp {
  return new Dapp({
    dappId: event.args.dappId,
    id: getContractAddress(event.args.smartContract),
    owner: getSs58Address(event.args.owner),
    state: DappState.Registered,
    registeredAt: BigInt(event.block.timestamp ?? 0),
    registrationBlockNumber: event.block.height,
    stakersCount: 0,
  });
}

export async function unregisterDapp(
  ctx: ProcessorContext<Store>,
  event: Event
): Promise<Dapp | undefined> {
  const dapp = await getDapp(ctx, event.args.smartContract);
  if (dapp) {
    dapp.state = DappState.Unregistered;
    dapp.unregisteredAt = BigInt(event.block.timestamp ?? 0);
    dapp.unregistrationBlockNumber = event.block.height;
    return dapp;
  } else {
    ctx.log.warn(`${event.name}:: Dapp ${event.args.address} not found.`);
  }

  return undefined;
}

export async function updateOwner(
  ctx: ProcessorContext<Store>,
  event: Event
): Promise<Dapp | undefined> {
  const dapp = await getDapp(ctx, event.args.smartContract);
  if (dapp) {
    dapp.owner = getSs58Address(event.args.newOwner);
    return dapp;
  } else {
    ctx.log.warn(`${event.name}:: Dapp ${event.args.address} not found.`);
  }

  return undefined;
}

export async function updateBeneficiary(
  ctx: ProcessorContext<Store>,
  event: Event
): Promise<Dapp | undefined> {
  const dapp = await getDapp(ctx, event.args.smartContract);
  if (dapp) {
    dapp.beneficiary = getSs58Address(event.args.beneficiary);
    return dapp;
  } else {
    ctx.log.warn(`${event.name}:: Dapp ${event.args.address} not found.`);
  }

  return undefined;
}

async function updateStakersCount(
  entities: Entities,
  dapp: Dapp,
  dappAggregated: DappAggregatedDaily | undefined,
  event: Event,
  day: number,
  stake: Stake,
  ctx: ProcessorContext<Store>
) {
  const newSubperiod = await ctx.store.findOneBy(Subperiod, {
    timestamp: BigInt(day),
  });

  if (newSubperiod && newSubperiod.type === SubperiodType.Voting) {
    return;
  }

  if (dappAggregated) {
    const entity = entities.StakersCountToUpdate.find(
      (e) => e.timestamp === BigInt(day) && e.dappAddress === stake.dappAddress
    );

    if (entity) {
      entity.stakersCount = dapp.stakersCount;
    } else {
      dappAggregated.stakersCount = dapp.stakersCount;
      entities.StakersCountToUpdate.push(dappAggregated);
    }
  } else {
    const entity = entities.StakersCountToInsert.find(
      (e) => e.timestamp === BigInt(day) && e.dappAddress === stake.dappAddress
    );

    if (entity) {
      entity.stakersCount = dapp.stakersCount;
    } else {
      entities.StakersCountToInsert.push(
        new DappAggregatedDaily({
          id: event.id,
          timestamp: BigInt(day),
          dappAddress: stake.dappAddress,
          stakersCount: dapp.stakersCount,
        })
      );
    }
  }
}

export async function handleStakersCount(
  ctx: ProcessorContext<Store>,
  stake: Stake,
  entities: Entities,
  event: Event
): Promise<Dapp | undefined> {
  const dapp = await ctx.store.findOneBy(Dapp, { id: stake.dappAddress });
  const stakes = await ctx.store.findBy(Stake, {
    dappAddress: stake.dappAddress,
    stakerAddress: stake.stakerAddress,
    expiredAt: IsNull(),
  });
  stakes.push(stake); // Current stake is not yet in the db.
  const day = getFirstTimestampOfTheDay(event.block.timestamp ?? 0);
  const dappAggregated = await ctx.store.findOneBy(DappAggregatedDaily, {
    timestamp: BigInt(day),
    dappAddress: stake.dappAddress,
  });

  const totalStake = stakes.reduce((a, b) => a + b.amount, 0n);
  if (
    dapp &&
    (stakes.length === 1 || (stakes.length > 1 && totalStake === stake.amount))
  ) {
    // user stakes the first time or stakes again after un-staking everything before.
    dapp.stakersCount++;
    upsertStakers(entities, stake, ctx);
    insertUniqueStakerAddress(entities, stake, ctx);
    updateStakersCount(entities, dapp, dappAggregated, event, day, stake, ctx);
    return dapp;
  } else if (dapp && totalStake === 0n) {
    // user un-stakes everything.
    dapp.stakersCount--;
    deleteStakers(stake, ctx);
    deleteUniqueStakerAddress(stake, ctx);
    updateStakersCount(entities, dapp, dappAggregated, event, day, stake, ctx);
    return dapp;
  } else if (dapp) {
    // user stakes again after un-staking some amount.
    upsertStakers(entities, stake, ctx);
    updateStakersCount(entities, dapp, dappAggregated, event, day, stake, ctx);
  }

  return undefined;
}

export async function deleteUniqueStakerAddress(
  stake: Stake,
  ctx: ProcessorContext<Store>
) {
  const uniqueStakerAddress = await ctx.store.findOneBy(UniqueStakerAddress, {
    id: stake.stakerAddress,
  });

  if (uniqueStakerAddress) {
    ctx.store.remove(uniqueStakerAddress);
  }
}

export async function deleteStakers(
  stake: Stake,
  ctx: ProcessorContext<Store>
) {
  const staker = await ctx.store.findOneBy(Stakers, {
    dappAddress: stake.dappAddress,
    stakerAddress: stake.stakerAddress,
  });

  if (staker) {
    ctx.store.remove(staker);
  }
}

export async function insertUniqueStakerAddress(
  entities: Entities,
  stake: Stake,
  ctx: ProcessorContext<Store>
) {
  const uniqueStakerAddress = await ctx.store.findOneBy(UniqueStakerAddress, {
    id: stake.stakerAddress,
  });

  const entity = entities.UniqueStakerAddressToInsert.find(
    (e) => e.id === stake.stakerAddress
  );

  if (entity) {
    return;
  } else {
    if (uniqueStakerAddress) {
      return;
    } else {
      entities.UniqueStakerAddressToInsert.push(
        new UniqueStakerAddress({
          id: stake.stakerAddress,
        })
      );
    }
  }
}

export async function upsertStakers(
  entities: Entities,
  stake: Stake,
  ctx: ProcessorContext<Store>
) {
  const staker = await ctx.store.findOneBy(Stakers, {
    dappAddress: stake.dappAddress,
    stakerAddress: stake.stakerAddress,
  });

  const entity = entities.StakersToUpsert.find(
    (e) =>
      e.dappAddress === stake.dappAddress &&
      e.stakerAddress === stake.stakerAddress
  );

  if (entity) {
    entity.amount = stake.amount;
  } else {
    if (staker) {
      staker.amount = stake.amount;
      entities.StakersToUpsert.push(staker);
    } else {
      entities.StakersToUpsert.push(
        new Stakers({
          id: stake.id,
          dappAddress: stake.dappAddress,
          stakerAddress: stake.stakerAddress,
          amount: stake.amount,
        })
      );
    }
  }
}

async function getDapp(
  ctx: ProcessorContext<Store>,
  dappAddress: SmartContract
) {
  const address = getContractAddress(dappAddress);
  const dapp = await ctx.store.findOneBy(Dapp, { id: address });

  return dapp;
}
