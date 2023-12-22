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
  const lock = await ctx.store.findOneBy(TvlAggregatedDaily, {
    id: day.toString(),
  });

  if (lock) {
    lock.tvl = lock.tvl + lockAmount;
    entities.TvlToUpdate.push(lock);
    await ctx.store.upsert(entities.TvlToUpdate);
  } else {
    // New day started. Fetch prev day lock and add to it.
    const prevDay = getFirstTimestampOfThePreviousDay(day);
    const prevDayLock = await ctx.store.findOneBy(TvlAggregatedDaily, {
      id: prevDay.toString(),
    });
    entities.TvlToInsert.push(
      new TvlAggregatedDaily({
        id: day.toString(),
        tvl: lockAmount + (prevDayLock?.tvl ?? 0n),
      })
    );
    await ctx.store.insert(entities.TvlToInsert);
  }
}
