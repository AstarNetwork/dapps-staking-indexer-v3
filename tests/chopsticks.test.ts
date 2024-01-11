import {
  beforeEach,
  afterEach,
  describe,
  it,
  expect,
  test,
} from "@jest/globals";
import {
  sendTransaction,
  testingPairs,
  SetupOption,
  setupContext,
} from "@acala-network/chopsticks-testing";

it("chopsticks test", async () => {
  const { alice, bob, charlie } = testingPairs();

  const finalOptions: SetupOption = {
    timeout: 60000000,
    endpoint: "wss://rpc.shibuya.astar.network",
  };

  const parachain = await setupContext(finalOptions);

  const calls = [
    parachain.api.tx.dappStaking.register(alice.address, {
      Evm: "0x0000000000000000000000000000000000000005",
    }),
    parachain.api.tx.dappStaking.register(bob.address, {
      Evm: "0x0000000000000000000000000000000000000006",
    }),
    parachain.api.tx.dappStaking.register(charlie.address, {
      Evm: "0x0000000000000000000000000000000000000007",
    }),
  ];

  const batch = parachain.api.tx.utility.batch(calls);
  const sudo = parachain.api.tx.sudo.sudo(batch);

  const tx1 = await sudo.signAsync(alice, { nonce: 1 });
  await parachain.dev.newBlock();
  console.log(tx1.toHuman());

  await parachain.teardown();
}, 60000000);

