require("dotenv").config();

import {
  queryDappStakingCurrentEraInfo,
  queryDappStakingLedger,
} from "../src/utils/queryDappStaking";

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

// queryDappStakingCurrentEraInfo("staked")
//   .then((result) => {
//     console.log(result);
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
