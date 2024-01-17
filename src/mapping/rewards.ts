import { Store } from "@subsquid/typeorm-store";
import { RewardEvent, RewardEventType, RewardAggregatedDaily } from "../model";
import { Event, ProcessorContext } from "../processor";
import {
  Entities,
  getSs58Address,
  getContractAddress,
  getFirstTimestampOfTheDay,
} from "../utils";
import { events } from "../types";

// Function to create and add a reward event
function createAndAddRewardEvent(
  event: Event,
  decodedData: any,
  eventType: RewardEventType,
  entities: Entities,
  ctx: ProcessorContext<Store>
) {
  const rewardEvent = new RewardEvent({
    id: event.id,
    transaction: eventType,
    contractAddress: decodedData.smartContract
      ? getContractAddress(decodedData.smartContract)
      : undefined,
    tierId: decodedData.tierId,
    userAddress: getSs58Address(decodedData.account || decodedData.beneficiary),
    era: decodedData.era ? BigInt(decodedData.era) : undefined,
    amount: decodedData.amount,
    period: decodedData.period,
    timestamp: BigInt(event.block.timestamp || 0),
    blockNumber: BigInt(event.block.height),
  });
  entities.RewardsToInsert.push(rewardEvent);
  createAndAddRewardsAggregated(event, decodedData, eventType, entities, ctx);
}

// Function to create and add a reward aggregated event
async function createAndAddRewardsAggregated(
  event: Event,
  decodedData: any,
  eventType: RewardEventType,
  entities: Entities,
  ctx: ProcessorContext<Store>
) {
  const day = getFirstTimestampOfTheDay(event.block.timestamp ?? 0);
  const beneficiary =
    eventType === RewardEventType.DAppReward
      ? getContractAddress(decodedData.smartContract)
      : getSs58Address(decodedData.account || decodedData.beneficiary);
  const RewardAggregated = await ctx.store.findOneBy(RewardAggregatedDaily, {
    timestamp: BigInt(day),
    beneficiary,
  });

  if (RewardAggregated) {
    RewardAggregated.amount += decodedData.amount;
    const entity = entities.RewardsAggregatedToUpsert.find(
      (e) => e.timestamp === BigInt(day) && e.beneficiary === beneficiary
    );

    if (entity) {
      entity.amount += decodedData.amount;
    } else {
      entities.RewardsAggregatedToUpsert.push(RewardAggregated);
    }
  } else {
    const entity = entities.RewardsAggregatedToUpsert.find(
      (e) => e.timestamp === BigInt(day) && e.beneficiary === beneficiary
    );

    if (entity) {
      entity.amount += decodedData.amount;
    } else {
      entities.RewardsAggregatedToUpsert.push(
        new RewardAggregatedDaily({
          id: event.id,
          timestamp: BigInt(day),
          beneficiary,
          amount: decodedData.amount,
        })
      );
    }
  }
}

export async function handleRewards(
  event: Event,
  entities: Entities,
  ctx: ProcessorContext<Store>
): Promise<void> {
  switch (event.name) {
    case events.dappStaking.reward.name:
      if (events.dappStaking.reward.v1.is(event)) {
        const decodedData = events.dappStaking.reward.v1.decode(event);
        createAndAddRewardEvent(
          event,
          decodedData,
          RewardEventType.Reward,
          entities,
          ctx
        );
      }
      break;
    case events.dappStaking.dAppReward.name:
      if (events.dappStaking.dAppReward.v1.is(event)) {
        const decodedData = events.dappStaking.dAppReward.v1.decode(event);
        createAndAddRewardEvent(
          event,
          decodedData,
          RewardEventType.DAppReward,
          entities,
          ctx
        );
      }
      break;
    case events.dappStaking.bonusReward.name:
      if (events.dappStaking.bonusReward.v1.is(event)) {
        const decodedData = events.dappStaking.bonusReward.v1.decode(event);
        createAndAddRewardEvent(
          event,
          decodedData,
          RewardEventType.BonusReward,
          entities,
          ctx
        );
      }
      break;
    default:
      break;
  }
}
