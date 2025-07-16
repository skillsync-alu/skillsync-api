import { Field, InputType } from "@nestjs/graphql";
import { MatchStatusType } from "../interfaces/match.interface";
import GraphQLObjectId from "graphql-type-object-id";
import { Types } from "mongoose";
import { IsObjectId } from "../../shared/validators/objectid.validator";
import { IsEnum, IsOptional } from "class-validator";

@InputType()
export class UpdateMatchInput {
  @Field(() => GraphQLObjectId)
  @IsObjectId({ field: "match" })
  id: Types.ObjectId;

  @Field(() => MatchStatusType)
  @IsEnum(MatchStatusType)
  matchStatus: MatchStatusType;

  @Field({ nullable: true })
  @IsOptional()
  details?: string;
}
