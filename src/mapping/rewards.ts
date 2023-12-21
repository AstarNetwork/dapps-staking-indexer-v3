import { Store } from "@subsquid/typeorm-store";
import { RewardEvent, RewardEventType } from "../model";
import { Event, ProcessorContext } from "../processor";
import { Entities, getSs58Address, getContractAddress } from "../utils";
import { events } from "../types";

export async function handleRewards(
  event: Event,
  entities: Entities
): Promise<void> {
  console.log("events", JSON.stringify(event));

  switch (event.name) {
    case events.dappStaking.reward.name:
      if (events.dappStaking.reward.v1.is(event)) {
        const { account, era, amount } =
          events.dappStaking.reward.v1.decode(event);
        const rewardEvent = new RewardEvent({
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
        });
        entities.RewardsToInsert.push(rewardEvent);
      }
      break;
    case events.dappStaking.dAppReward.name:
      if (events.dappStaking.dAppReward.v1.is(event)) {
        const { beneficiary, smartContract, tierId, era, amount } =
          events.dappStaking.dAppReward.v1.decode(event);
        const rewardEvent = new RewardEvent({
          id: event.id,
          transaction: RewardEventType.DAppReward,
          contractAddress: getContractAddress(smartContract),
          tierId,
          userAddress: getSs58Address(beneficiary),
          era: BigInt(era),
          amount,
          period: undefined,
          timestamp: BigInt(event.block.timestamp || 0),
          blockNumber: BigInt(event.block.height),
        });
        entities.RewardsToInsert.push(rewardEvent);
      }
      break;
    case events.dappStaking.bonusReward.name:
      if (events.dappStaking.bonusReward.v1.is(event)) {
        const { account, smartContract, period, amount } =
          events.dappStaking.bonusReward.v1.decode(event);
        const rewardEvent = new RewardEvent({
          id: event.id,
          transaction: RewardEventType.BonusReward,
          contractAddress: getContractAddress(smartContract),
          tierId: undefined,
          userAddress: getSs58Address(account),
          era: undefined,
          amount,
          period,
          timestamp: BigInt(event.block.timestamp || 0),
          blockNumber: BigInt(event.block.height),
        });
        entities.RewardsToInsert.push(rewardEvent);
      }
      break;
    default:
      break;
  }
}
