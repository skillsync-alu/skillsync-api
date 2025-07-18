import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { StarService } from "../services/star.service";
import { UseGuards } from "@nestjs/common";
import { Guard } from "../../authentication/guards/authentication.guard";
import { CurrentUser } from "../../authentication/decorators/current-user.decorator";
import { User } from "../../users/models/user.model";
import { FilterInput } from "../../shared/services/pagination/inputs/filter.input";
import GraphQLObjectId from "graphql-type-object-id";
import { Types } from "mongoose";
import { UsersResponse } from "../../users/responses/user.response";

@UseGuards(Guard)
@Resolver()
export class StarResolver {
  constructor(private readonly starService: StarService) {}

  @Query(() => UsersResponse)
  async getStarred(
    @CurrentUser() starrer: User,
    @Args({ name: "filter", type: () => FilterInput, nullable: false })
    filter: FilterInput
  ) {
    return await this.starService.getStarred(filter, starrer);
  }

  @Mutation(() => User)
  async starOrUnstar(
    @CurrentUser() starrer: User,
    @Args({ name: "starred", type: () => GraphQLObjectId, nullable: false })
    starred: Types.ObjectId
  ) {
    return await this.starService.starOrUnstar(starrer, starred);
  }
}
