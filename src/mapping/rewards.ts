import { Store } from "@subsquid/typeorm-store";
import { RewardEvent, RewardEventType } from "../model";
import { Event, ProcessorContext } from "../processor";
import { Entities, getFirstTimestampOfTheDay } from "../utils";
import { events } from "../types";
import * as ss58 from "@subsquid/ss58";

export async function handleRewards(
  ctx: ProcessorContext<Store>,
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
          userAddress: ss58.encode({ prefix: 5, bytes: account }),
          era: BigInt(era),
          amount,
          period: undefined,
          timestamp: BigInt(
            event.block.timestamp !== undefined ? event.block.timestamp : 0
          ),
          blockNumber: BigInt(event.block.height),
        };
        entities.RewardsToInsert.push(rewardEvent);
      }
      break;
    default:
      break;
  }
}
