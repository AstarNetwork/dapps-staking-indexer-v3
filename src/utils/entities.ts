import { Dapp, DappAggregatedDaily, Stake, StakingEvent, TvlAggregatedDaily } from "../model";

export class Entities {
  public DappsToInsert: Dapp[] = [];
  public DappsToUpdate: Dapp[] = [];
  public TvlToInsert: TvlAggregatedDaily[] = [];
  public TvlToUpdate: TvlAggregatedDaily[] = [];
  public StakersCountToInsert: DappAggregatedDaily[] = [];
  public StakersCountToUpdate: DappAggregatedDaily[] = [];
  public StakesToInsert: Stake[] = [];
  public StakesToUpdate: Stake[] = [];
  public stakingEvent: StakingEvent[] = [];
}
