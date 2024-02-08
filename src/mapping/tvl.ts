import { Store } from "@subsquid/typeorm-store";
import { Event, ProcessorContext } from "../processor";
import { events } from "../types";
import {
  Entities,
  getFirstTimestampOfTheDay,
  getFirstTimestampOfThePreviousDay,
} from "../utils";
import { TvlAggregatedDaily, Subperiod } from "../model";

export async function handleTvl(
  ctx: ProcessorContext<Store>,
  event: Event,
  entities: Entities
): Promise<void> {
  const amount = BigInt(event.args.amount);
  let lockAmount;

  if (
    event.name === events.dappStaking.unlocking.name // ||  event.name === events.dappStaking.claimedUnlocked.name
  ) {
    lockAmount = -amount;
  } else {
    lockAmount = amount;
  }

  const day = getFirstTimestampOfTheDay(event.block.timestamp ?? 0);

  const entity =
    entities.TvlToInsert.find((e) => e.id === day.toString()) ||
    entities.TvlToUpdate.find((e) => e.id === day.toString());

  if (entity) {
    entity.tvl = entity.tvl + lockAmount;
  } else {
    const lock = await ctx.store.findOneBy(TvlAggregatedDaily, {
      id: day.toString(),
    });

    if (lock) {
      lock.tvl = lock.tvl + lockAmount;
      lock.blockNumber = event.block.height;
      entities.TvlToUpdate.push(lock);
    } else {
      // New day started. Fetch prev day lock and add to it.
      const prevDayLock = await fetchPreviousDayWithTVL(ctx, day);

      entities.TvlToInsert.push(
        new TvlAggregatedDaily({
          id: day.toString(),
          blockNumber: event.block.height,
          tvl: lockAmount + prevDayLock.tvl,
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
