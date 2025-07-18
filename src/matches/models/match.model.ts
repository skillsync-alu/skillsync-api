import { Field, ObjectType } from "@nestjs/graphql";
import { ModelDefinition, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "../../shared/models/document.model";
import { User } from "../../users/models/user.model";
import { Model, Types } from "mongoose";
import { MatchStatusType } from "../interfaces/match.interface";
import { MatchStatus, MatchStatusSchema } from "./match-status.model";
import { InternalServerErrorException } from "@nestjs/common";

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

MatchSchema.statics.getMatcheeCount = async function (matcher: Types.ObjectId) {
  try {
    return await this.count({ matcher, isDeleted: false });
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
};

MatchSchema.statics.getMatcherCount = async function (matchee: Types.ObjectId) {
  try {
    return await this.count({ matchee, isDeleted: false });
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
};

MatchSchema.statics.isMatched = async function (
  matcher: Types.ObjectId,
  matchee: Types.ObjectId
) {
  try {
    return Boolean(
      await this.exists({
        matcher,
        matchee,
        isDeleted: false
      })
    );
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
};

MatchSchema.pre("save", async function (next) {
  if (this.isModified("statuses")) {
    this.set("status", this.statuses[this.statuses.length - 1].type);
  }

  next();
});

export interface MatchRepository extends Model<Match> {
  getMatcheeCount(matcher: Types.ObjectId): Promise<number>;

  getMatcherCount(matchee: Types.ObjectId): Promise<number>;

  isMatched(matcher: Types.ObjectId, matchee: Types.ObjectId): Promise<boolean>;
}
