function checkEnv() {
  if (!process.env.V3_FIRST_BLOCK) {
    throw new Error("V3_FIRST_BLOCK is not set");
  }

  if (!process.env.V3_PERIOD_LENGTH) {
    throw new Error("V3_PERIOD_LENGTH is not set");
  }

  if (!process.env.V3_FIRST_ERA) {
    throw new Error("V3_FIRST_ERA is not set");
  }

  if (!process.env.V3_ERAS_PER_PERIOD) {
    throw new Error("V3_ERAS_PER_PERIOD is not set");
  }
}

export function getPeriodForBlock(blockNumber: number): number {
  checkEnv();
  return (
    Math.floor(
      (blockNumber - Number(process.env.V3_FIRST_BLOCK)) /
        Number(process.env.V3_PERIOD_LENGTH)
    ) + 1
  );
}

export function getPeriodForEra(eraNumber: number): number {
  checkEnv();
  return (
    Math.floor(
      (eraNumber - Number(process.env.V3_FIRST_ERA)) /
        Number(process.env.V3_ERAS_PER_PERIOD)
    ) + 1
  );
}
