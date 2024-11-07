import type { Call } from "@subsquid/substrate-processor";
import { getSs58Address, type Entities } from "../utils";
import { events } from "../types";
import type { ProcessorContext } from "../processor";
import type { Store } from "@subsquid/typeorm-store";
import { AddressMapping } from "../model";

// Map H160 and SS58 address
export async function handleAddressMapping(
  ctx: ProcessorContext<Store>,
  call: Call,
  entities: Entities,
  mappingCache: Map<string, string>
): Promise<void> {
  // Map on stake event
  const stakingEvent = call.events.find(
    (x) => x.name === events.dappStaking.stake.name
  );
  const ethereumExecutedEvent = call.events.find(
    (x) => x.name === "Ethereum.Executed"
  );

  if (stakingEvent && ethereumExecutedEvent) {
    const h160Address = ethereumExecutedEvent.args.from;
    const ss58Address = getSs58Address(stakingEvent.args.account);

    let mapping = entities.MappingsToInsert.find((x) => x.id === h160Address);
    if (!mapping) {
      mapping = await ctx.store.get(AddressMapping, h160Address);
      if (!mapping) {
        mapping = new AddressMapping({
          id: h160Address,
          ss58Address: ss58Address,
          mappedAtBlock: call.block.height,
        });
        entities.MappingsToInsert.push(mapping);
      }
    }

    if (!mappingCache.has(ss58Address)) {
      mappingCache.set(ss58Address, h160Address);
    }
  }
}
