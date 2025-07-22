import { Field, ObjectType } from "@nestjs/graphql";
import { ModelDefinition, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Document } from "src/shared/models/document.model";
import { User } from "src/users/models/user.model";

@Schema({ timestamps: true })
@ObjectType()
export class Feedback extends Document {
    @Field(() =>String)
    @Prop({type:String,required: true})
    message:string;
    @Field(() =>User)
    @Prop({type:Types.ObjectId,ref: User.name,required:true})
    user:User;
}

export const Feedbackschema = SchemaFactory.createForClass(Feedback);
export const Feedbackmodel: ModelDefinition = {name: Feedback.name,schema:Feedbackschema}
export type FeedbackRepository = Model<Feedback>;