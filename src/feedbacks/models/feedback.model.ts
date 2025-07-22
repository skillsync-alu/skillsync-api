import { Field, ObjectType } from "@nestjs/graphql";
import { ModelDefinition, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Match } from "../../matches/models/match.model";
import { Document } from "../../shared/models/document.model";
import { User } from "../../users/models/user.model";
import {
  FeedbackMessage,
  FeedbackMessageSchema
} from "./feedback-message.model";

@Schema({ timestamps: true })
@ObjectType()
export class Feedback extends Document {
  @Field(() => Boolean)
  @Prop({ type: Boolean, isRequired: false, default: false })
  isDeleted: boolean;

  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  matcher: User;

  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  matchee: User;

  @Field(() => Match)
  @Prop({ type: Types.ObjectId, ref: Match.name, required: true })
  match: Match;

  @Field(() => [FeedbackMessage])
  @Prop({
    default: [],
    type: [{ type: FeedbackMessageSchema, required: true }]
  })
  messages: FeedbackMessage[];
}

export const Feedbackschema = SchemaFactory.createForClass(Feedback);

export const Feedbackmodel: ModelDefinition = {
  name: Feedback.name,
  schema: Feedbackschema
};

export type FeedbackRepository = Model<Feedback>;
