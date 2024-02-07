import { Store } from "@subsquid/typeorm-store";
import { Event, ProcessorContext } from "../processor";
import { events } from "../types";
import {
  Entities,
  getFirstTimestampOfTheDay,
  getFirstTimestampOfThePreviousDay,
} from "../utils";
import { TvlAggregatedDaily } from "../model";

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
      const prevDayLock = await fetchPreviousDayWithTVL(ctx, day, event);

      entities.TvlToInsert.push(
        new TvlAggregatedDaily({
          id: day.toString(),
          blockNumber: event.block.height,
          tvl: lockAmount + (prevDayLock?.tvl ?? 0n),
        })
      );
    }
  }
}

async function fetchPreviousDayWithTVL(
  ctx: ProcessorContext<Store>,
  initialDay: number,
  event: Event
) {
  let day = initialDay; // Initialize the day variable with the starting day timestamp
  const initialBlockRange = Number(process.env.BLOCK_RANGE) + 100;

  while (true) {
    const prevDay = getFirstTimestampOfThePreviousDay(day); // Get the timestamp for the start of the previous day
    const prevDayLock = await ctx.store.findOneBy(TvlAggregatedDaily, {
      id: prevDay.toString(),
    }); // Fetch the previous day's lock

    if (prevDayLock && prevDayLock.tvl) {
      // If prevDayLock has a TVL value, return it
      return prevDayLock;
    } else if (event.block.height <= initialBlockRange) {
      // If the block height is less than or equal to 5335633, return 0
      return undefined;
    }

    day = prevDay; // Update the day to the previous day for the next iteration
  }
}
