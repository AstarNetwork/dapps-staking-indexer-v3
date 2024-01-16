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
import { changeSystemDate } from "./utils";

it("chopsticks test", async () => {
  const { alice, bob, charlie } = testingPairs();

  const finalOptions: SetupOption = {
    timeout: 60000000,
    endpoint: "wss://rpc.shibuya.astar.network",
    port: 9944,
  };

  await changeSystemDate(-14);

  const parachain = await setupContext(finalOptions);

  let calls = [
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

  let batch = parachain.api.tx.utility.batch(calls);
  let sudo = parachain.api.tx.sudo.sudo(batch);

  const tx1 = await sudo.signAsync(alice);
  await parachain.dev.newBlock();
  console.log(tx1.toHuman());

  calls = [
    parachain.api.tx.dappStaking.stake(
      {
        Evm: "0x0000000000000000000000000000000000000005",
      },
      1000
    ),
    parachain.api.tx.dappStaking.stake(
      {
        Evm: "0x0000000000000000000000000000000000000006",
      },
      2000
    ),
  ];
  batch = parachain.api.tx.utility.batch(calls);
  const tx2 = await batch.signAsync(alice);
  await parachain.dev.newBlock();
  console.log(tx2.toHuman());

  await changeSystemDate(2);

  calls = [
    parachain.api.tx.dappStaking.stake(
      {
        Evm: "0x0000000000000000000000000000000000000006",
      },
      3000
    ),
    parachain.api.tx.dappStaking.stake(
      {
        Evm: "0x0000000000000000000000000000000000000007",
      },
      4000
    ),
  ];
  batch = parachain.api.tx.utility.batch(calls);
  const tx3 = await batch.signAsync(bob);
  await parachain.dev.newBlock();
  console.log(tx3.toHuman());

  // Force subperiod
  let tx = parachain.api.tx.dappStaking.force("Subperiod");
  sudo = parachain.api.tx.sudo.sudo(tx);
  const tx4 = await sudo.signAsync(alice);
  console.log(tx4.toHuman());
  await parachain.dev.newBlock();

  calls = [
    parachain.api.tx.dappStaking.stake(
      {
        Evm: "0x0000000000000000000000000000000000000005",
      },
      5000
    ),
    parachain.api.tx.dappStaking.stake(
      {
        Evm: "0x0000000000000000000000000000000000000007",
      },
      6000
    ),
  ];
  batch = parachain.api.tx.utility.batch(calls);
  const tx5 = await batch.signAsync(charlie);
  await parachain.dev.newBlock();
  console.log(tx5.toHuman());

  await changeSystemDate(2);
  await parachain.teardown();
}, 60000000);
