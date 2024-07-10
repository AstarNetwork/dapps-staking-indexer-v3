import https from "https";

const priceCache = new Map<string, number>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getUsdPriceWithCache(
  token: string,
  timestamp: string
): Promise<number> {
  const cacheKey = `${token}-${timestamp}`;
  if (priceCache.has(cacheKey)) {
    return Number(priceCache.get(cacheKey));
  } else {
    const price = await getUsdPrice(token, timestamp);
    if (price > 0) {
      priceCache.set(cacheKey, price);
    } else {
      // We hit the rate limit, wait a bit and try again.
      // This can possibly happen once per day, because price is cached,
      // so it is not a big deal to wait.
      await sleep(10000);
    }
    return price;
  }
}

export async function getUsdPrice(
  token: string,
  timestamp: string
): Promise<number> {
  const url = `https://api.coingecko.com/api/v3/coins/${token}/history?date=${formatDate(
    timestamp
  )}`;
  console.info(url);
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      res.setEncoding("utf8");
      let body = "";

      res.on("data", (data) => {
        body += data;
      });

      res.on("end", () => {
        const json = JSON.parse(body);
        return resolve(Number(json.market_data?.current_price?.usd ?? 0));
      });

      res.on("error", (error) => {
        return reject(error);
      });
    });
  });
}

export function formatDate(timestamp: string) {
  const date = new Date(Number(timestamp));
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}
