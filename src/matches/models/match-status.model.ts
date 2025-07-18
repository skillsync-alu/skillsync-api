import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MatchStatusType } from "../interfaces/match.interface";
import { User } from "../../users/models/user.model";
import { Types } from "mongoose";

@ObjectType()
@Schema({ _id: false, timestamps: false, versionKey: false })
export class MatchStatus {
  @Field()
  @Prop({ required: true })
  message: string;

  @Field({ nullable: true })
  @Prop({ required: false })
  details?: string;

  @Field(() => MatchStatusType)
  @Prop({
    required: true,
    enum: MatchStatusType,
    default: MatchStatusType.Draft
  })
  type: MatchStatusType;

  @Field(() => Date)
  @Prop({ type: Date, required: true })
  timeStamp: Date;

  @Field(() => User, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: User.name, required: false })
  createdBy?: User;
}

export const MatchStatusSchema = SchemaFactory.createForClass(MatchStatus);
