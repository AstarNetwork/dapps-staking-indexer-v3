require("dotenv").config();

import { queryDappStakingLedger } from "../src/utils/queryDappStakingLedger";

queryDappStakingLedger(
  "5GL86B8xNiWxiSZHxRNh6nrFcBAYe7TTkDkADjLyLMLsvNh4",
  "staked"
)
  .then((result) => {
    console.log(result);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
