import { Dapp, Stake, StakingEvent, TvlAggregatedDaily } from "../model";

export class Entities {
  public DappsToInsert: Dapp[] = [];
  public DappsToUpdate: Dapp[] = [];
  public TvlToInsert: TvlAggregatedDaily[] = [];
  public TvlToUpdate: TvlAggregatedDaily[] = [];
  public StakesToInsert: Stake[] = [];
  public stakingEvent: StakingEvent[] = [];
}
