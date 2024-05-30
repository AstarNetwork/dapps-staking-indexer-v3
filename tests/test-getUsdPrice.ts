require("dotenv").config();

import { getUsdPriceWithCache } from "../src/utils/getUsdPrice";

async function fetchAndLogUsdPrice() {
  try {
    // Fetch price for the first timestamp
    let timestamp = "1708560000000";
    let result = await getUsdPriceWithCache(process.env.ARCHIVE!, timestamp);
    console.log(result);

    // Fetch price for the second timestamp
    timestamp = "1707955200000";
    result = await getUsdPriceWithCache(process.env.ARCHIVE!, timestamp);
    console.log(result);

    // Attempt to fetch price for the first timestamp again
    timestamp = "1708560000000";
    result = await getUsdPriceWithCache(process.env.ARCHIVE!, timestamp);
    console.log(result);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fetchAndLogUsdPrice();
