import {
  Dapp,
  DappAggregatedDaily,
  StakersCountAggregatedDaily,
  Stake,
  Stakers,
  StakingEvent,
  UniqueStakerAddress,
  UniqueLockerAddress,
  TvlAggregatedDaily,
  RewardEvent,
  Subperiod,
  RewardAggregatedDaily,
  StakesPerDapAndPeriod,
} from "../model";

export class Entities {
  public DappsToInsert: Dapp[] = [];
  public DappsToUpdate: Dapp[] = [];
  public TvlToInsert: TvlAggregatedDaily[] = [];
  public TvlToUpdate: TvlAggregatedDaily[] = [];
  public StakersCountToInsert: DappAggregatedDaily[] = [];
  public StakersCountToUpdate: DappAggregatedDaily[] = [];
  public StakersCountAggregatedDailyToUpsert: StakersCountAggregatedDaily[] =
    [];
  public StakersToUpsert: Stakers[] = [];
  public UniqueStakerAddressToInsert: UniqueStakerAddress[] = [];
  public UniqueLockerAddressToUpsert: UniqueLockerAddress[] = [];
  public StakesToInsert: Stake[] = [];
  public StakesToUpdate: Stake[] = [];
  public stakingEvent: StakingEvent[] = [];
  public RewardsToInsert: RewardEvent[] = [];
  public RewardsAggregatedToUpsert: RewardAggregatedDaily[] = [];
  public SubperiodsToInsert: Subperiod[] = [];
  public StakesPerDapAndPeriodToUpsert: StakesPerDapAndPeriod[] = [];
}
