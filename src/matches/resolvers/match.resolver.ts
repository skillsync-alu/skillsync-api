import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { MatchService } from "../services/match.service";
import { MatchResponse } from "../responses/match.response";
import { MatchFilterInput } from "../inputs/match-filter.input";
import { UsersResponse } from "../../users/responses/user.response";
import { UseGuards } from "@nestjs/common";
import { Guard } from "../../authentication/guards/authentication.guard";
import { CurrentUser } from "../../authentication/decorators/current-user.decorator";
import { User } from "../../users/models/user.model";
import { FilterInput } from "../../shared/services/pagination/inputs/filter.input";
import { Match } from "../models/match.model";
import GraphQLObjectId from "graphql-type-object-id";
import { Types } from "mongoose";
import { Roles } from "../../authentication/guards/roles.guard";
import { UserType } from "../../users/interfaces/user.interface";
import { UpdateMatchInput } from "../inputs/update-match.input";

@UseGuards(Guard)
@Resolver()
export class MatchResolver {
  constructor(private readonly matchService: MatchService) {}

  @Mutation(() => Match)
  async createMatch(
    @CurrentUser() matchee: User,
    @Args({ name: "matcher", type: () => GraphQLObjectId, nullable: false })
    matcher: Types.ObjectId
  ) {
    return await this.matchService.createMatch(matcher, matchee);
  }

  @Query(() => MatchResponse)
  async getMatches(
    @CurrentUser() user: User,
    @Args({ name: "filter", type: () => MatchFilterInput, nullable: false })
    filter: MatchFilterInput
  ) {
    return await this.matchService.getMatches(filter, user);
  }

  @UseGuards(Guard, Roles([UserType.User]))
  @Query(() => UsersResponse)
  async getMatchers(
    @CurrentUser() matchee: User,
    @Args({ name: "filter", type: () => FilterInput, nullable: false })
    filter: FilterInput
  ) {
    return await this.matchService.getMatchers(filter, matchee);
  }

  @UseGuards(Guard, Roles([UserType.Tutor]))
  @Query(() => UsersResponse)
  async getMatchees(
    @CurrentUser() matcher: User,
    @Args({ name: "filter", type: () => FilterInput, nullable: false })
    filter: FilterInput
  ) {
    return await this.matchService.getMatchees(filter, matcher);
  }

  @UseGuards(Guard, Roles([UserType.User]))
  @Mutation(() => Match)
  async updateMatchAsStudent(
    @CurrentUser() matchee: User,
    @Args({ name: "input", type: () => UpdateMatchInput, nullable: false })
    input: UpdateMatchInput
  ) {
    return await this.matchService.updateMatchAsStudent(input, matchee);
  }

  @UseGuards(Guard, Roles([UserType.Tutor]))
  @Mutation(() => Match)
  async updateMatchAsTutor(
    @CurrentUser() matchee: User,
    @Args({ name: "input", type: () => UpdateMatchInput, nullable: false })
    input: UpdateMatchInput
  ) {
    return await this.matchService.updateMatchAsTutor(input, matchee);
  }
}
