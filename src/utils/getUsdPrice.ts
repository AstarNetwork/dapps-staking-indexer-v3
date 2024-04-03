import https from "https";

const priceCache = new Map<string, number>();

export async function getUsdPriceWithCache(
  token: string,
  timestamp: string
): Promise<number> {
  const cacheKey = `${token}-${timestamp}`;
  if (priceCache.has(cacheKey)) {
    return Number(priceCache.get(cacheKey));
  } else {
    const price = await getUsdPrice(token, timestamp);
    priceCache.set(cacheKey, price);
    return price;
  }
}

export async function getUsdPrice(
  token: string,
  timestamp: string
): Promise<number> {
  const url = `https://api.coingecko.com/api/v3/coins/${token}/history?date=${formatDate(
    timestamp,
    "America/Panama"
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
        return resolve(Number(json.market_data.current_price.usd));
      });

      res.on("error", (error) => {
        return reject(error);
      });
    });
  });
}

function formatDate(timestamp: string, timezone = "UTC") {
  const date = new Date(Number(timestamp));
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: timezone,
  });

  // Using the formatter to get the parts of the date
  const parts = formatter.formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const year = parts.find((part) => part.type === "year")?.value;

  // Constructing the date in "DD-MM-YYYY" format
  const dateToLocal = `${day}-${month}-${year}`;
  return dateToLocal;
}
