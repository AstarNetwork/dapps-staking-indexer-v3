import { Store } from "@subsquid/typeorm-store";
import { Event, ProcessorContext } from "../processor";
import { Entities } from "../utils";
import { events } from "../types";
import { EraPeriodMapping } from "../model";

export const IS_SHIBUYA = process.env.ARCHIVE === "shibuya";
let currentPeriod: number | undefined;
const eraPeriodMappingCache = new Map<number, number>();

async function getLastPeriodMapping(
  ctx: ProcessorContext<Store>
): Promise<EraPeriodMapping | undefined> {
  const mapping = await ctx.store.find(EraPeriodMapping, {
    order: { id: "DESC" },
    take: 1,
  });

  return mapping.length > 0 ? mapping[0] : undefined;
}

export async function getCurrentPeriod(
  entities: Entities,
  ctx: ProcessorContext<Store>
): Promise<number> {
  if (currentPeriod === undefined) {
    if (entities.EraPeriodMappingsToInsert.length > 0) {
      setCurrentPeriod(
        entities.EraPeriodMappingsToInsert[
          entities.EraPeriodMappingsToInsert.length - 1
        ].period
      );
    } else {
      // Load the last period from the database
      const mapping = await getLastPeriodMapping(ctx);
      // There must be are record in the database, so let the indexer to
      // crash if this is not the case.
      setCurrentPeriod(mapping!.period);
    }
  }

  return currentPeriod!;
}

export function setCurrentPeriod(period: number): void {
  currentPeriod = period;
}

export async function getPeriodForEraFromDatabase(
  eraNumber: number,
  entities: Entities,
  ctx: ProcessorContext<Store>
): Promise<number> {
  const cacheItem = eraPeriodMappingCache.get(eraNumber);
  if (cacheItem) {
    return cacheItem;
  }

  const entity = entities.EraPeriodMappingsToInsert.find(
    (x) => x.id === eraNumber.toString()
  );
  if (entity) {
    return entity.period;
  }

  // Not in memory, it must be in the database.
  const mapping = await ctx.store.get(EraPeriodMapping, eraNumber.toString());
  if (mapping) {
    eraPeriodMappingCache.set(eraNumber, mapping.period);
    return mapping.period;
  }

  throw new Error(`EraPeriodMapping not found for era ${eraNumber}`);
}

export async function handleNewEra(
  entities: Entities,
  event: Event,
  ctx: ProcessorContext<Store>
): Promise<void> {
  if (events.dappStaking.newEra.v1.is(event)) {
    const previousEra = await getLastPeriodMapping(ctx);
    const decodedData = events.dappStaking.newEra.v1.decode(event);
    const newEraPeriodMapping = new EraPeriodMapping({
      id: decodedData.era.toString(),
      period: previousEra?.period ?? 0,
    });
    entities.EraPeriodMappingsToInsert.push(newEraPeriodMapping);
  } else {
    ctx.log.error("Unsupported NewEra event version");
  }
}
