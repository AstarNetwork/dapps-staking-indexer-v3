import { Stake } from "../model";
import { Event } from "../processor";
import { events } from "../types";
import { getContractAddress, getFirstTimestampOfTheDay, getSs58Address } from "../utils";

export function getStake(event: Event): Stake {
  const amount = BigInt(event.args.amount);
  const stakeAmount =
    event.name === events.dappStaking.stake.name ? amount : -amount;

  return new Stake({
    id: event.id,
    dappAddress: getContractAddress(event.args.smartContract),
    stakerAddress: getSs58Address(event.args.account),
    blockNumber: event.block.height,
    timestamp: BigInt(event.block.timestamp ?? 0),
    amount: stakeAmount,
  });
}
