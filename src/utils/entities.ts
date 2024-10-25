import type {
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
  StakesPerStakerAndPeriod,
  Burn,
  AddressMapping,
} from "../model";

export class Entities {
  public DappsToInsert: Dapp[] = [];
  public DappsToUpdate: Dapp[] = [];
  public TvlToUpsert: TvlAggregatedDaily[] = [];
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
  public StakesPerStakerAndPeriodToUpsert: StakesPerStakerAndPeriod[] = [];
  public BurnEventsToInsert: Burn[] = [];
  public mappingsToInsert: AddressMapping[] = [];
}
