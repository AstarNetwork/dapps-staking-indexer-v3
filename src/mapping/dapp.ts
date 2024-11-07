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
import { getCurrentPeriod } from "./protocolState";

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
  stake: Stake
) {
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
  const period = await getCurrentPeriod(entities, ctx);
  const dapp =
    entities.DappsToInsert.find((x) => x.id === stake.dappAddress) ??
    (await ctx.store.findOneBy(Dapp, { id: stake.dappAddress }));
  const stakes = await ctx.store.findBy(Stake, {
    dappAddress: stake.dappAddress,
    stakerAddress: stake.stakerAddress,
    period,
  });
  stakes.push(stake); // Current stake is not yet in the db.
  const day = getFirstTimestampOfTheDay(event.block.timestamp ?? 0);
  const dappAggregated = await ctx.store.findOneBy(DappAggregatedDaily, {
    timestamp: BigInt(day),
    dappAddress: stake.dappAddress,
  });

  if (dapp) {
    const totalStake = stakes.reduce((a, b) => a + b.amount, 0n);

    // it means user staked to dapp
    if (stake.amount > 0n) {
      await upsertStakers(entities, stake, ctx, totalStake);
      await insertUniqueStakerAddress(entities, stake, ctx);
    } else {
      await deleteStakers(stake, ctx);
      await deleteUniqueStakerAddress(stake, ctx);
    }

    const stakers = await getStakersList(ctx, entities, dapp, period);
    dapp.stakersCount = stakers.length;
    await upsertStakers(entities, stake, ctx, totalStake);
    await updateStakersCount(entities, dapp, dappAggregated, event, day, stake);

    return dapp;
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
    await ctx.store.remove(uniqueStakerAddress);
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
    await ctx.store.remove(staker);
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
  ctx: ProcessorContext<Store>,
  totalStake: bigint
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
    entity.amount = totalStake;
  } else {
    if (staker) {
      staker.amount = totalStake;
      entities.StakersToUpsert.push(staker);
    } else {
      entities.StakersToUpsert.push(
        new Stakers({
          id: stake.id,
          dappAddress: stake.dappAddress,
          stakerAddress: stake.stakerAddress,
          amount: totalStake,
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

async function getStakersList(
  ctx: ProcessorContext<Store>,
  entities: Entities,
  dapp: Dapp,
  period: number
) {
  const stakesFromDatabase = await ctx.store.findBy(Stake, {
    period,
    dappAddress: dapp.id, // this is address of dapp staking contract
  });

  const stakesToUpserts = entities.StakersToUpsert.filter(
    (staker) => staker.dappAddress === dapp.id
  );

  const stakes: Array<{ id: string; stakerAddress: string; amount: bigint }> =
    [];

  stakesFromDatabase.forEach((stake) => {
    stakes.push({
      id: stake.id,
      stakerAddress: stake.stakerAddress,
      amount: stake.amount,
    });
  });

  stakesToUpserts.forEach((stake) => {
    const index = stakes.findIndex((_stake) => _stake.id === stake.id);

    if (index === -1) {
      stakes.push(stake);
    } else {
      stakes[index] = stake;
    }
  });

  const sumsByStaker: { [key: string]: bigint } = stakes.reduce(
    (acc: { [key: string]: bigint }, { stakerAddress, amount }) => {
      acc[stakerAddress] = (acc[stakerAddress] || BigInt(0)) + BigInt(amount);
      return acc;
    },
    {}
  );

  const stakersList = Object.entries(sumsByStaker)
    .map(([stakerAddress, amount]) => ({
      stakerAddress,
      amount,
    }))
    .filter((staker) => staker.amount !== BigInt(0));

  return stakersList;
}

export function updateDapp(dapp: Dapp, entities: Entities) {
  const existedDappIndexes: Array<number> = [];

  entities.DappsToUpdate.forEach((d, index) => {
    if (d.id === dapp.id) {
      existedDappIndexes.push(index);
    }
  });

  for (const existedIndex of existedDappIndexes) {
    entities.DappsToUpdate.splice(existedIndex, 1);
  }

  entities.DappsToUpdate.push(dapp);
}
