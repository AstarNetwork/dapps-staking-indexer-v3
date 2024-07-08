import { Store } from "@subsquid/typeorm-store";
import { Event, ProcessorContext } from "../processor";
import { Entities, getContractAddress, getSs58Address } from "../utils";
import { events } from "../types";
import { getPeriodForBlock } from "./protocolState";
import { aggregateStakesPerDapp, aggregateStakesPerStaker } from "./stake";

export async function handleRewardsPeriodAggregation(
  event: Event,
  entities: Entities,
  ctx: ProcessorContext<Store>
): Promise<void> {
  const period = getPeriodForBlock(event.block.height);

  switch (event.name) {
    case events.dappStaking.reward.name:
      const decodedData = events.dappStaking.reward.v1.decode(event);
      await aggregateStakesPerStaker(
        ctx,
        entities,
        getSs58Address(decodedData.account),
        BigInt(0),
        decodedData.amount,
        BigInt(0),
        period
      );
      break;
    case events.dappStaking.dAppReward.name:
      const decodedDataDapp = events.dappStaking.dAppReward.v1.decode(event);
      const contractAddress = getContractAddress(event.args.smartContract);

      await aggregateStakesPerDapp(
        ctx,
        entities,
        contractAddress,
        BigInt(0),
        decodedDataDapp.amount,
        period
      );
      break;
    case events.dappStaking.bonusReward.name:
      const decodedDataBonus = events.dappStaking.bonusReward.v1.decode(event);
      await aggregateStakesPerStaker(
        ctx,
        entities,
        getSs58Address(decodedDataBonus.account),
        BigInt(0),
        BigInt(0),
        decodedDataBonus.amount,
        period
      );
      break;
    default:
      break;
  }
}
