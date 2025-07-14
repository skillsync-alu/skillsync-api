import { Args, Query, Resolver } from "@nestjs/graphql";
import { MatchService } from "../services/match.service";
import { MatchResponse } from "../responses/match.response";
import { MatchFilterInput } from "../inputs/match-filter.input";
import { UsersResponse } from "../../users/responses/user.response";
import { UseGuards } from "@nestjs/common";
import { Guard } from "../../authentication/guards/authentication.guard";
import { CurrentUser } from "../../authentication/decorators/current-user.decorator";
import { User } from "../../users/models/user.model";
import { FilterInput } from "../../shared/services/pagination/inputs/filter.input";

@UseGuards(Guard)
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

  @Query(() => UsersResponse)
  async getMatchers(
    @CurrentUser() matchee: User,
    @Args({ name: "filter", type: () => FilterInput, nullable: false })
    filter: FilterInput
  ) {
    return await this.matchService.getMatchers(filter, matchee);
  }
}
