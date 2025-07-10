import { Args, Query, Resolver } from "@nestjs/graphql";
import { MatchService } from "../services/match.service";
import { MatchResponse } from "../responses/match.response";
import { MatchFilterInput } from "../inputs/match-filter.input";

@Resolver()
export class MatchResolver {
  constructor(private readonly matchService: MatchService) {}

  @Query(() => MatchResponse)
  async getMatches(
    @Args({ name: "filter", type: () => MatchFilterInput, nullable: false })
    filter: MatchFilterInput
  ) {
    return await this.matchService.getMatches(filter);
  }
}
