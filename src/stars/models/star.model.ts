import { Field, ObjectType } from "@nestjs/graphql";
import { ModelDefinition, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import GraphQLObjectId from "graphql-type-object-id";
import { Model, Types } from "mongoose";
import { Document } from "../../shared/models/document.model";
import { User } from "../../users/models/user.model";
import { InternalServerErrorException } from "@nestjs/common";

@ObjectType()
@Schema({ timestamps: true })
export class Star extends Document {
  @Field(() => GraphQLObjectId)
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  starrer: User;

  @Field(() => GraphQLObjectId)
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  starred: User;
}

export const StarSchema = SchemaFactory.createForClass(Star);

StarSchema.index({ starrer: 1, starred: 1 }, { unique: true });

export const StarModel: ModelDefinition = {
  name: Star.name,
  schema: StarSchema
};

StarSchema.statics.getStarredCount = async function (starrer: Types.ObjectId) {
  try {
    return await this.count({ starrer });
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
};

StarSchema.statics.getStarrerCount = async function (starred: Types.ObjectId) {
  try {
    return await this.count({ starred });
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
};

StarSchema.statics.isStarred = async function (
  starrer: Types.ObjectId,
  starred: Types.ObjectId
) {
  try {
    return Boolean(await this.exists({ starrer, starred }));
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
};

export interface StarRepository extends Model<Star> {
  getStarredCount(starrer: Types.ObjectId): Promise<number>;

  getStarrerCount(starred: Types.ObjectId): Promise<number>;

  isStarred(starrer: Types.ObjectId, starred: Types.ObjectId): Promise<boolean>;
}
