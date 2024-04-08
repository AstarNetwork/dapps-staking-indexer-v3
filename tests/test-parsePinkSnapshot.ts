import { gql, request } from 'graphql-request';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

// GraphQL endpoint
const endpoint = 'https://squid.subsquid.io/dapps-staking-indexer-astar/v/v5/graphql';

// GraphQL query
const query = gql`
{
  stakersCountAggregatedDailies(orderBy: id_DESC) {
    blockNumber
    stakersAmount
    stakersCount
    usdPrice
    id
  }
  stakers(orderBy: stakerAddress_ASC) {
    amount
    stakerAddress
  }
}`;

// Fetch data from GraphQL API
async function fetchData() {
  try {
    const data = await request(endpoint, query);
    
    // Convert timestamp ID to Date and round usdPrice for stakersCountAggregatedDailies
    const dailiesWithDate = (data as any).stakersCountAggregatedDailies.map((daily: any) => ({
      ...daily,
      id: new Date(parseInt(daily.id)).toISOString().split('T')[0], // Convert to YYYY-MM-DD
      usdPrice: Math.round((daily.usdPrice + Number.EPSILON) * 100) / 100, // Round up to 2 decimal places
      stakersAmount: Math.floor(parseFloat(daily.stakersAmount) / 1e18) // Apply division and drop decimals
    }));

    // Aggregate stakers by stakerAddress and sum amount, considering the division by 10^18
    const aggregatedStakers = (data as any).stakers.reduce((acc: any, staker: any) => {
      if (!acc[staker.stakerAddress]) {
        acc[staker.stakerAddress] = { amount: 0, stakerAddress: staker.stakerAddress };
      }
      acc[staker.stakerAddress].amount += parseFloat(staker.amount) / 1e18;
      return acc;
    }, {});

    // Convert aggregatedStakers object to array and apply floor to amount
    const aggregatedStakersArray = Object.values(aggregatedStakers).map((staker: any) => ({
      stakerAddress: staker.stakerAddress,
      amount: Math.floor(staker.amount) // Ensure amount is without decimals
    }));
    
    // Add the extra function call here
    outputTotalAmount(aggregatedStakersArray);

    await writeCsv('stakersCountAggregatedDailies.csv', dailiesWithDate, [
      {id: 'blockNumber', title: 'Block Number'},
      {id: 'stakersAmount', title: 'Stakers Amount (x10^18)'},
      {id: 'stakersCount', title: 'Stakers Count'},
      {id: 'usdPrice', title: 'USD Price (Rounded)'},
      {id: 'id', title: 'Date'}
    ]);
    
    await writeCsv('aggregatedStakers.csv', aggregatedStakersArray, [
      {id: 'stakerAddress', title: 'Staker Address'},
      {id: 'amount', title: 'Summed Amount'}
    ]);

    console.log('CSV files have been written successfully.');
  } catch (error) {
    console.error('Error fetching GraphQL data:', error);
  }
}

// Function to write data to a CSV file
async function writeCsv(fileName: string, records: any[], headerColumns: {id: string, title: string}[]) {
  const csvWriter = createCsvWriter({
    path: fileName,
    header: headerColumns
  });

  await csvWriter.writeRecords(records);
}

// Function to sum and output the total amount
function outputTotalAmount(aggregatedStakersArray: any[]) {
  const totalAmount = aggregatedStakersArray.reduce((sum, staker) => sum + staker.amount, 0);
  console.log(`Total Summed Amount: ${totalAmount}`);
}

fetchData();
