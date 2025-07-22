import { InputType, Field } from "@nestjs/graphql";
import { IsString } from "class-validator";
import GraphQLObjectId from "graphql-type-object-id";
import { Types } from "mongoose";
import { IsObjectId } from "../../shared/validators/objectid.validator";

@InputType()
export class UpdateFeedbackInput {
  @Field(() => GraphQLObjectId)
  @IsObjectId()
  match: Types.ObjectId;

  @Field()
  @IsString()
  message: string;
}
