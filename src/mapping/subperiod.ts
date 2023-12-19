import { Store } from "@subsquid/typeorm-store";
import { Dapp, DappAggregatedDaily } from "../model";
import { Event, ProcessorContext } from "../processor";
import { Entities, getFirstTimestampOfTheDay } from "../utils";

export async function handleSubperiod(
  ctx: ProcessorContext<Store>,
  event: Event,
  entities: Entities
): Promise<void> {
  const day = getFirstTimestampOfTheDay(event.block.timestamp ?? 0);
  const events = JSON.stringify(event);
  console.log("events", events);

  // Zero out stakers count for all dapps when the subperiod is Voting
  if (event.args.subperiod.__kind === "Voting") {
    try {
      const dapps = await ctx.store.find(Dapp);
      for (const dapp of dapps) {
        console.log(dapp.id, 'now is 0, was:', dapp.stakersCount);
        dapp.stakersCount = 0;
        entities.DappsToUpdate.push(dapp);

        let aggregated = await ctx.store.findOneBy(DappAggregatedDaily, {
          timestamp: BigInt(day),
          dappAddress: dapp.id,
        });
      
        if (aggregated) {
          aggregated.stakersCount = 0;
          entities.StakersCountToUpdate.push(aggregated);
        }
      }
    } catch (error) {
      console.error("Error fetching Dapps:", error);
    }
  }
}
