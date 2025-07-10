import { Field, ObjectType } from "@nestjs/graphql";
import { ModelDefinition, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "../../shared/models/document.model";
import { User } from "../../users/models/user.model";
import { Model, Types } from "mongoose";
import { MatchStatusType } from "../interfaces/match.interface";
import { MatchStatus, MatchStatusSchema } from "./match-status.model";

@ObjectType()
@Schema({ timestamps: true })
export class Match extends Document {
  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  matcher: User;

  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  matchee: User;

  @Field(() => [String])
  @Prop({ type: [String], required: true, default: [] })
  skillsOfferred: string[];

  @Field(() => [String])
  @Prop({ type: [String], required: true, default: [] })
  skillsWanted: string[];

  @Field(() => Boolean)
  @Prop({ type: Boolean, required: true, default: false })
  isDeleted: boolean;

  @Field(() => Boolean)
  @Prop({ type: Boolean, required: true, default: false })
  isConfirmed: boolean;

  @Field(() => MatchStatusType)
  @Prop({
    required: true,
    enum: MatchStatusType,
    default: MatchStatusType.Draft
  })
  status: MatchStatusType;

  @Field(() => [MatchStatus])
  @Prop({
    default: [],
    required: true,
    type: [{ type: MatchStatusSchema, required: true }]
  })
  statuses: MatchStatus[];
}

export const MatchSchema = SchemaFactory.createForClass(Match);

export const MatchModel: ModelDefinition = {
  name: Match.name,
  schema: MatchSchema
};

export type MatchRepository = Model<Match>;
