import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { User } from "../../users/models/user.model";
import { FeedbackUserType } from "../interfaces/feedback.interface";

@Schema({ _id: false, timestamps: false, versionKey: false })
@ObjectType()
export class FeedbackMessage {
  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User;

  @Field(() => FeedbackUserType)
  @Prop({ type: String, enum: FeedbackUserType, required: true })
  userType: FeedbackUserType;

  @Field(() => String)
  @Prop({ type: String, required: true })
  message: string;

  @Field(() => Date)
  @Prop({ type: Date, default: () => new Date() })
  timeStamp: Date;
}

export const FeedbackMessageSchema =
  SchemaFactory.createForClass(FeedbackMessage);
