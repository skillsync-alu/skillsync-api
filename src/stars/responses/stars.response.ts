import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "../../shared/services/pagination/responses/pagination.response";
import GraphQLObjectId from "graphql-type-object-id/dist";

@ObjectType()
export class Star {
  @Field(() => GraphQLObjectId)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  avatar?: string;
}

@ObjectType()
export class StarsResponse extends PaginationResponse<Star> {
  constructor(users: Star[], totalCount: number, totalPages: number) {
    super(users, totalCount, totalPages);
  }
  @Field(() => [Star])
  list: Star[];
}
