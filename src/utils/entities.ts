import {
  Dapp,
  DappAggregatedDaily,
  StakersCountAggregatedDaily,
  Stake,
  StakingEvent,
  TvlAggregatedDaily,
  RewardEvent,
  Subperiod,
  RewardAggregatedDaily,
} from "../model";

export class Entities {
  public DappsToInsert: Dapp[] = [];
  public DappsToUpdate: Dapp[] = [];
  public TvlToInsert: TvlAggregatedDaily[] = [];
  public TvlToUpdate: TvlAggregatedDaily[] = [];
  public StakersCountToInsert: DappAggregatedDaily[] = [];
  public StakersCountToUpdate: DappAggregatedDaily[] = [];
  public StakersCountAggregatedDailyToUpsert: StakersCountAggregatedDaily[] = [];
  public StakesToInsert: Stake[] = [];
  public StakesToUpdate: Stake[] = [];
  public stakingEvent: StakingEvent[] = [];
  public RewardsToInsert: RewardEvent[] = [];
  public RewardsAggregatedToInsert: RewardAggregatedDaily[] = [];
  public RewardsAggregatedToUpdate: RewardAggregatedDaily[] = [];
  public SubperiodsToInsert: Subperiod[] = [];
}
