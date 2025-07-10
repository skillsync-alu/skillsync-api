import { Field, InputType } from "@nestjs/graphql";
import { FilterInput } from "../../shared/services/pagination/inputs/filter.input";
import GraphQLObjectId from "graphql-type-object-id";
import { IsObjectId } from "../../shared/validators/objectid.validator";
import { Types } from "mongoose";

@InputType()
export class MatchFilterInput extends FilterInput {
  @Field(() => GraphQLObjectId, { nullable: true })
  @IsObjectId()
  matcher?: Types.ObjectId;

  @Field(() => GraphQLObjectId, { nullable: true })
  @IsObjectId()
  matchee?: Types.ObjectId;
}
