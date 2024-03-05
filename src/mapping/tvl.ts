import { Store } from "@subsquid/typeorm-store";
import { Event, ProcessorContext } from "../processor";
import { events } from "../types";
import {
  Entities,
  getSs58Address,
  getFirstTimestampOfTheDay,
  getFirstTimestampOfThePreviousDay,
} from "../utils";
import { TvlAggregatedDaily, Subperiod, UniqueLockerAddress } from "../model";
import { getUsdPriceWithCache } from "../utils/getUsdPrice";

export async function handleTvl(
  ctx: ProcessorContext<Store>,
  event: Event,
  entities: Entities
): Promise<void> {
  const amount = BigInt(event.args.amount);
  const address = getSs58Address(event.args.account);
  let lockAmount;

  if (event.name === events.dappStaking.unlocking.name) {
    lockAmount = -amount;
    await deleteUniqueLockerAddress(lockAmount, address, ctx);
  } else {
    lockAmount = amount;
    await upsertUniqueLockerAddress(lockAmount, address, ctx, entities);
  }

  const day = getFirstTimestampOfTheDay(event.block.timestamp ?? 0);
  const totalLockers: number = await ctx.store.count(UniqueLockerAddress);

  const entity =
    entities.TvlToInsert.find((e) => e.id === day.toString()) ||
    entities.TvlToUpdate.find((e) => e.id === day.toString());

  if (entity) {
    entity.tvl += lockAmount;
    entity.lockersCount = totalLockers;
  } else {
    const lock = await ctx.store.findOneBy(TvlAggregatedDaily, {
      id: day.toString(),
    });

    if (lock) {
      lock.tvl += lockAmount;
      lock.lockersCount = totalLockers;
      lock.blockNumber = event.block.height;
      entities.TvlToUpdate.push(lock);
    } else {
      // New day started. Fetch prev day lock and add to it.
      const prevDayLock = await fetchPreviousDayWithTVL(ctx, day);
      const usdPrice = await getUsdPriceWithCache(
        process.env.ARCHIVE!,
        day.toString()
      );

      entities.TvlToInsert.push(
        new TvlAggregatedDaily({
          id: day.toString(),
          blockNumber: event.block.height,
          lockersCount: totalLockers,
          tvl: lockAmount + prevDayLock.tvl,
          usdPrice,
        })
      );
    }
  }
}

// Fetches the TVL (Total Value Locked) for the first day prior to the initial day with an available TVL.
async function fetchPreviousDayWithTVL(
  ctx: ProcessorContext<Store>,
  initialDay: number
): Promise<TvlAggregatedDaily> {
  // Pre-fetch all subperiods to determine if special handling is needed
  const subperiods = await ctx.store.find(Subperiod);

  let day = initialDay;
  while (true) {
    const prevDay = getFirstTimestampOfThePreviousDay(day);
    const prevDayLock = await ctx.store.findOneBy(TvlAggregatedDaily, {
      id: prevDay.toString(),
    });

    if (prevDayLock?.tvl) {
      return prevDayLock;
    } else if (subperiods.length <= 1) {
      // If there's one or 0 subperiod, there is no need to check the previous day, return 0n
      return new TvlAggregatedDaily({ tvl: 0n });
    }

    day = prevDay; // Prepare for the next iteration with the previous day
  }
}

export async function upsertUniqueLockerAddress(
  amount: bigint,
  address: string,
  ctx: ProcessorContext<Store>,
  entities: Entities
) {
  const uniqueLockerAddress = await ctx.store.findOneBy(UniqueLockerAddress, {
    id: address,
  });

  const entity = entities.UniqueLockerAddressToUpsert.find(
    (e) => e.id === address
  );

  if (entity) {
    entity.amount += amount;
    return;
  } else {
    if (uniqueLockerAddress) {
      uniqueLockerAddress.amount += amount;
      await ctx.store.save(uniqueLockerAddress);
      return;
    } else {
      entities.UniqueLockerAddressToUpsert.push(
        new UniqueLockerAddress({
          id: address,
          amount,
        })
      );
    }
  }
}

export async function deleteUniqueLockerAddress(
  amount: bigint,
  address: string,
  ctx: ProcessorContext<Store>
) {
  const uniqueLockerAddress = await ctx.store.findOneBy(UniqueLockerAddress, {
    id: address,
  });

  if (uniqueLockerAddress) {
    uniqueLockerAddress.amount += amount;

    if (uniqueLockerAddress.amount === 0n) {
      await ctx.store.remove(uniqueLockerAddress);
    } else {
      await ctx.store.save(uniqueLockerAddress);
    }
  }
}
