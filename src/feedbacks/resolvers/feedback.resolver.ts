import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { FeedbackService } from "../services/feedback.service";
import { Feedback } from "../models/feedback.model";
import { UseGuards } from "@nestjs/common";
import { Guard } from "../../authentication/guards/authentication.guard";
import { CurrentUser } from "../../authentication/decorators/current-user.decorator";
import { User } from "../../users/models/user.model";
import { UpdateFeedbackInput } from "../inputs/update-feedback.input";
import GraphQLObjectId from "graphql-type-object-id";
import { Types } from "mongoose";

@UseGuards(Guard)
@Resolver()
export class FeedbackResolver {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Query(() => Feedback)
  async getFeedback(
    @CurrentUser() user: User,
    @Args({ name: "match", type: () => GraphQLObjectId, nullable: false })
    match: Types.ObjectId
  ) {
    return await this.feedbackService.getFeedback(match, user);
  }

  @Mutation(() => Feedback)
  async updateFeedback(
    @CurrentUser() user: User,
    @Args({ name: "input", type: () => UpdateFeedbackInput, nullable: false })
    input: UpdateFeedbackInput
  ) {
    return await this.feedbackService.updateFeedback(input, user);
  }
}
