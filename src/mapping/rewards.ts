import { RewardEvent, RewardEventType } from "../model";
import { Event } from "../processor";
import { Entities, getSs58Address, getContractAddress } from "../utils";
import { events } from "../types";

// Function to create and add a reward event
function createAndAddRewardEvent(event: Event, decodedData: any, eventType: RewardEventType, entities: Entities) {
  const rewardEvent = new RewardEvent({
    id: event.id,
    transaction: eventType,
    contractAddress: decodedData.smartContract ? getContractAddress(decodedData.smartContract) : undefined,
    tierId: decodedData.tierId,
    userAddress: getSs58Address(decodedData.account || decodedData.beneficiary),
    era: decodedData.era ? BigInt(decodedData.era) : undefined,
    amount: decodedData.amount,
    period: decodedData.period,
    timestamp: BigInt(event.block.timestamp || 0),
    blockNumber: BigInt(event.block.height),
  });
  entities.RewardsToInsert.push(rewardEvent);
}

export async function handleRewards(
  event: Event,
  entities: Entities
): Promise<void> {

  switch (event.name) {
    case events.dappStaking.reward.name:
      if (events.dappStaking.reward.v1.is(event)) {
        const decodedData = events.dappStaking.reward.v1.decode(event);
        createAndAddRewardEvent(event, decodedData, RewardEventType.Reward, entities);
      }
      break;
    case events.dappStaking.dAppReward.name:
      if (events.dappStaking.dAppReward.v1.is(event)) {
        const decodedData = events.dappStaking.dAppReward.v1.decode(event);
        createAndAddRewardEvent(event, decodedData, RewardEventType.DAppReward, entities);
      }
      break;
    case events.dappStaking.bonusReward.name:
      if (events.dappStaking.bonusReward.v1.is(event)) {
        const decodedData = events.dappStaking.bonusReward.v1.decode(event);
        createAndAddRewardEvent(event, decodedData, RewardEventType.BonusReward, entities);
      }
      break;
    default:
      break;
  }
}
