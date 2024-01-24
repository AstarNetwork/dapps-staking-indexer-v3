import { Arg, Field, ObjectType, Query, Resolver } from "type-graphql";
import type { EntityManager } from "typeorm";
import { Stakers } from "../model";

// Define custom GraphQL ObjectType of the query result
@ObjectType()
export class MyQueryResult {
  @Field(() => Number, { nullable: false })
  total!: number;

  constructor(props: Partial<MyQueryResult>) {
    Object.assign(this, props);
  }
}

@Resolver()
export class CountResolver {
  // Set by depenency injection
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [MyQueryResult])
  async myQuery(): Promise<MyQueryResult[]> {
    const manager = await this.tx();
    // execute custom SQL query
    const result = await manager
      .getRepository(Stakers)
      .query(`SELECT COUNT(DISTINCT staker_address) as total FROM stakers;`);
    return result;
  }
}
