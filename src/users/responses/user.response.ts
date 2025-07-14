import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "../../shared/services/pagination/responses/pagination.response";
import { User } from "../models/user.model";

@ObjectType()
export class UsersResponse extends PaginationResponse<User> {
  @Field(() => [User])
  list: User[];
}
