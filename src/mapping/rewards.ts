import { Store } from "@subsquid/typeorm-store";
import { RewardEvent, RewardEventType } from "../model";
import { Event, ProcessorContext } from "../processor";
import { Entities, getSs58Address } from "../utils";
import { events } from "../types";

export async function handleRewards(
  event: Event,
  entities: Entities
): Promise<void> {
  console.log("events", JSON.stringify(event));

  let rewardEvent: RewardEvent;
  switch (event.name) {
    case events.dappStaking.reward.name:
      if (events.dappStaking.reward.v1.is(event)) {
        const { account, era, amount } =
          events.dappStaking.reward.v1.decode(event);
        rewardEvent = {
          id: event.id,
          transaction: RewardEventType.Reward,
          contractAddress: undefined,
          tierId: undefined,
          userAddress: getSs58Address(account),
          era: BigInt(era),
          amount,
          period: undefined,
          timestamp: BigInt(event.block.timestamp || 0),
          blockNumber: BigInt(event.block.height),
        };
        entities.RewardsToInsert.push(rewardEvent);
      }
      break;
    default:
      break;
  }
}
