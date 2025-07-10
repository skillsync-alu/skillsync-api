import { Field, InputType } from "@nestjs/graphql";
import { IsObjectId } from "../../shared/validators/objectid.validator";
import GraphQLObjectId from "graphql-type-object-id";
import { Types } from "mongoose";

@InputType()
export class CreateMatchInput {
  @Field(() => GraphQLObjectId)
  @IsObjectId()
  matcher: Types.ObjectId;

  @Field(() => GraphQLObjectId)
  @IsObjectId()
  matchee: Types.ObjectId;
}
