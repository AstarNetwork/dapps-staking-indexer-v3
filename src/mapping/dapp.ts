import { Store } from "@subsquid/typeorm-store";
import { Dapp, DappState, DappAggregatedDaily, Stake } from "../model";
import { Event, ProcessorContext } from "../processor";
import {
  Entities,
  getFirstTimestampOfTheDay,
  getContractAddress,
  getSs58Address,
} from "../utils";
import { SmartContract } from "../types/v1";

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
  });
  stakes.push(stake); // Current stake is not yet in the db.
  const day = getFirstTimestampOfTheDay(event.block.timestamp ?? 0);
  const found = await ctx.store.findOneBy(DappAggregatedDaily, {
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
    if (found) {
      found.stakersCount = dapp.stakersCount;
      entities.StakersCountToUpdate.push(found);
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
    return dapp;
  } else if (dapp && totalStake === 0n) {
    dapp.stakersCount--;
    if (found) {
      found.stakersCount = dapp.stakersCount;
      entities.StakersCountToUpdate.push(found);
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
    return dapp;
  } else if (dapp) {
    if (found) {
      found.stakersCount = dapp.stakersCount;
      entities.StakersCountToUpdate.push(found);
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

  return undefined;
}

async function getDapp(
  ctx: ProcessorContext<Store>,
  dappAddress: SmartContract
) {
  const address = getContractAddress(dappAddress);
  const dapp = await ctx.store.findOneBy(Dapp, { id: address });

  return dapp;
}
