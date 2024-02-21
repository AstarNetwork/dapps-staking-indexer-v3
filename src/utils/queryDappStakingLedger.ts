function String2Number(bigNumber: string): number {
  return Number(BigInt(bigNumber) / BigInt(10) ** BigInt(18));
}

export async function queryDappStakingLedger(address: string, param: string) {
  const { ApiPromise, WsProvider } = require("@polkadot/api");

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

  try {
    // console.log("RPC_ENDPOINT", process.env.RPC_ENDPOINT);
    const provider = new WsProvider(process.env.RPC_ENDPOINT);
    const api = new ApiPromise({ provider });

    await api.isReady;
    const rawLedger = await api.query.dappStaking.ledger(address);
    const ledger: Ledger = rawLedger.toJSON();

    const locked = String2Number(ledger.locked);
    const staked =
      String2Number(ledger.staked.voting) +
      String2Number(ledger.staked.buildAndEarn) +
      String2Number(ledger.stakedFuture.voting) +
      String2Number(ledger.stakedFuture.buildAndEarn);

    // console.log("ledger", ledger);

    return param === "locked" ? locked : staked;
  } catch (error) {
    throw error;
  }
}
