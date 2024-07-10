import { Store } from "@subsquid/typeorm-store";
import { Event, ProcessorContext } from "../processor";
import { Entities } from "../utils";
import { events } from "../types";
import { Burn } from "../model";

export async function insertBurnEvent(
  entities: Entities,
  event: Event,
  ctx: ProcessorContext<Store>
): Promise<void> {
  if (events.balances.burned.v1.is(event)) {
    const decodedData = events.balances.burned.v1.decode(event);
    const burn = new Burn({
      id: event.id,
      timestamp: BigInt(event.block.timestamp ?? 0),
      amount: decodedData.amount,
      user: decodedData.who,
      blockNumber: event.block.height,
    });
    entities.BurnEventsToInsert.push(burn);
  } else {
    ctx.log.error("Unsupported burn event version");
  }
}
