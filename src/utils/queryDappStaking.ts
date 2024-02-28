interface Ledger {
  locked: string;
  unlocking: number[];
  staked: {
    voting: string;
    buildAndEarn: string;
    era: number;
    period: number;
  };
  stakedFuture: {
    voting: string;
    buildAndEarn: string;
    era: number;
    period: number;
  };
  contractStakeCount: number;
}

interface EraInfo {
  totalLocked: string;
  unlocking: number[];
  currentStakeAmount: {
    voting: string;
    buildAndEarn: string;
    era: number;
    period: number;
  };
  nextStakeAmount: {
    voting: string;
    buildAndEarn: string;
    era: number;
    period: number;
  };
  contractStakeCount: number;
}

function String2Number(bigNumber: string | null | undefined): number {
  if (!bigNumber) {
    bigNumber = "0";
  }
  return Number(BigInt(bigNumber) / BigInt(10) ** BigInt(18));
}

export async function queryDappStakingLedger(address: string, param: string) {
  try {
    const { ApiPromise, WsProvider } = require("@polkadot/api");
    const api = await ApiPromise.create({
      provider: new WsProvider(process.env.RPC_ENDPOINT),
    });

    await api.isReady;
    const rawResult = await api.query.dappStaking.ledger(address);
    const result: Ledger = rawResult.toJSON();
    // console.log("Ledger", result);

    const locked = String2Number(result.locked);
    const staked =
      String2Number(result.staked.voting) +
      String2Number(result.staked.buildAndEarn) +
      String2Number(result.stakedFuture?.voting) +
      String2Number(result.stakedFuture?.buildAndEarn);

    return param === "locked" ? locked : staked;
  } catch (error) {
    throw error;
  }
}

export async function queryDappStakingCurrentEraInfo(param: string) {
  try {
    const { ApiPromise, WsProvider } = require("@polkadot/api");
    const api = await ApiPromise.create({
      provider: new WsProvider(process.env.RPC_ENDPOINT),
    });

    await api.isReady;
    const rawResult = await api.query.dappStaking.currentEraInfo();
    const result: EraInfo = rawResult.toJSON();

    const locked = String2Number(result.totalLocked);
    const staked =
      String2Number(result.nextStakeAmount.voting) +
      String2Number(result.nextStakeAmount.buildAndEarn);

    return param === "locked" ? locked : staked;
  } catch (error) {
    throw error;
  }
}

export async function queryDappStakingTierConfig(param: string) {
  try {
    const { ApiPromise, WsProvider } = require("@polkadot/api");
    const api = await ApiPromise.create({
      provider: new WsProvider(process.env.RPC_ENDPOINT),
    });

    await api.isReady;
    const rawResult = await api.query.dappStaking.tierConfig();
    const result = rawResult.toJSON();

    return result[param];
  } catch (error) {
    throw error;
  }
}

export async function queryDappStakingGetDappTierAssignment(): Promise<Map<number, number>> {
  const { BN } = require("@polkadot/util");
  const { ApiPromise, WsProvider } = require("@polkadot/api");
  const api = await ApiPromise.create({
    provider: new WsProvider(process.env.RPC_ENDPOINT),
  });

  await api.isReady;
  const tierAssignmentsBytes = await api.rpc.state.call(
    "DappStakingApi_get_dapp_tier_assignment",
    ""
  );
  const tierAssignment = api.createType(
    "BTreeMap<u16, u8>",
    tierAssignmentsBytes
  );

  const result = new Map<number, number>();
  tierAssignment.forEach((value: typeof BN, key: typeof BN) =>
    result.set(key.toNumber(), value.toNumber())
  );

  return result;
}
