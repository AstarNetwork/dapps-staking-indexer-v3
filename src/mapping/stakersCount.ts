import { Store } from "@subsquid/typeorm-store";
import {
  StakersCountAggregatedDaily,
  Subperiod,
  SubperiodType,
  UniqueStakerAddress,
} from "../model";
import { Entities, getFirstTimestampOfTheDay } from "../utils";
import { ProcessorContext, Block } from "../processor";

export async function handleStakersCountAggregated(
  ctx: ProcessorContext<Store>,
  entities: Entities,
  header: Block
) {
  const day = getFirstTimestampOfTheDay(header.timestamp ?? 0);

  // Check if it is a new Voting subperiod day, if so, skip
  const newSubperiod = await ctx.store.findOneBy(Subperiod, {
    timestamp: BigInt(day),
  });
  if (newSubperiod && newSubperiod.type === SubperiodType.Voting) {
    return;
  }

  // get staker's count from UniqueStakerAddress
  const totalStakers: number = await ctx.store.count(UniqueStakerAddress);
  console.log(`Total stakers: ${totalStakers} and ${header.height}`);

  // Check if there is already an entry for this day
  const stakersCountAggregated = await ctx.store.findOneBy(
    StakersCountAggregatedDaily,
    {
      id: day.toString(),
    }
  );

  // If there is already an entry for this day, and the stakers count is the same, skip
  if (
    stakersCountAggregated &&
    stakersCountAggregated.stakersCount === totalStakers
  ) {
    return;
  }

  const entity = entities.StakersCountAggregatedDailyToUpsert.find(
    (e) => e.id === day.toString()
  );

  if (entity) {
    entity.stakersCount = totalStakers;
  } else {
    entities.StakersCountAggregatedDailyToUpsert.push(
      new StakersCountAggregatedDaily({
        id: day.toString(),
        blockNumber: header.height,
        stakersCount: totalStakers,
      })
    );
  }
}
