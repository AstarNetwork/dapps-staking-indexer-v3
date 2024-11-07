import { Store } from "@subsquid/typeorm-store";
import {
  Dapp,
  Subperiod,
  SubperiodType,
  Stakers,
  UniqueStakerAddress,
} from "../model";
import { Event, ProcessorContext } from "../processor";
import { Entities, getFirstTimestampOfTheDay } from "../utils";
import { updateDapp } from "./dapp";
import { setCurrentPeriod } from "./protocolState";

export async function handleSubperiod(
  ctx: ProcessorContext<Store>,
  event: Event,
  entities: Entities
): Promise<void> {
  // There must be an era period mapping entity in memory since NewEra event is raised
  // immediately before NewSubperiod event.
  const period = event.args.number;
  entities.EraPeriodMappingsToInsert[
    entities.EraPeriodMappingsToInsert.length - 1
  ].period = period;
  setCurrentPeriod(period);

  const day = getFirstTimestampOfTheDay(event.block.timestamp ?? 0);

  entities.SubperiodsToInsert.push(
    new Subperiod({
      id: event.id,
      type: event.args.subperiod.__kind,
      blockNumber: event.block.height,
      timestamp: BigInt(day),
    })
  );

  // Zero out stakers count for all dapps when the subperiod is Voting
  if (event.args.subperiod.__kind === SubperiodType.Voting) {
    try {
      // Dapp Store
      const dapps = await ctx.store.find(Dapp);

      for (const dapp of dapps) {
        dapp.stakersCount = 0;
        updateDapp(dapp, entities);
      }

      // Remove all stakers and unique staker addresses
      const stakers = await ctx.store.find(Stakers);
      await ctx.store.remove(stakers);
      const uniqueStakerAddresses = await ctx.store.find(UniqueStakerAddress);
      await ctx.store.remove(uniqueStakerAddresses);
    } catch (error) {
      console.error("Error fetching Dapps:", error);
    }
  }
}
