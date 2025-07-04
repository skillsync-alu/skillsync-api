import { Resolver } from "@nestjs/graphql";
import { UserService } from "../services/user.service";

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}
}
