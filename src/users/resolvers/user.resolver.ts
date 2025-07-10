import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UserService } from "../services/user.service";
import { User } from "../models/user.model";
import { UseGuards } from "@nestjs/common";
import { UpdateUserInput } from "../inputs/update-user.input";
import { CurrentToken } from "../../authentication/decorators/current-token.decorator";
import { CurrentUser } from "../../authentication/decorators/current-user.decorator";
import { Guard } from "../../authentication/guards/authentication.guard";

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  async getUser(
    @CurrentToken() token: string,
    @Args({ name: "username", type: () => String, nullable: true })
    username?: string
  ) {
    return await this.userService.getUser(token, username);
  }

  @UseGuards(Guard)
  @Mutation(() => User)
  async updateUser(
    @CurrentUser() user: User,
    @Args({ name: "input", type: () => UpdateUserInput, nullable: false })
    input: UpdateUserInput
  ) {
    return await this.userService.updateUser(user, input);
  }
}
