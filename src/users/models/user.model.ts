import { Field, ObjectType } from "@nestjs/graphql";
import { ModelDefinition, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  ErrorHandlingMiddlewareFunction,
  Model,
  ProjectionType
} from "mongoose";
import { Document } from "../../shared/models/document.model";
import { UserType } from "../interfaces/user.interface";
import {
  countryCodes,
  CountryCodeType,
  defaultCountry
} from "../../shared/constants/shared.constant";
import { CountryCode } from "libphonenumber-js";
import { EncryptionService } from "../../shared/services/encryption/services/encryption.service";
import { JwtService } from "@nestjs/jwt";
import { ConflictException } from "@nestjs/common";
import { UserName_Already_Exists_Message } from "../../authentication/messages/authentication.message";

const encryptionService = new EncryptionService(new JwtService());

@ObjectType()
@Schema({ timestamps: true })
export class User extends Document {
  @Field()
  @Prop({ required: true, trim: true })
  firstName: string;

  @Field()
  @Prop({
    required: false,
    trim: true,
    validate: {
      validator: function (value: string) {
        // Allow empty string as valid but enforce that it cannot be null or undefined
        return value !== undefined && value !== null;
      },
      message: "Last Name is required"
    }
  })
  lastName: string;

  @Field()
  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  email: string;

  @Field()
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Field(() => CountryCodeType)
  @Prop({ required: true, enum: countryCodes, default: defaultCountry.iso })
  phoneCode: CountryCode;

  @Field({ nullable: true })
  @Prop({ required: false })
  phoneNumber?: string;

  @Field({ nullable: true })
  @Prop({ required: false })
  bio?: string;

  @Prop({
    required: true,
    select: false,
    validate: {
      validator: function (value: string) {
        // Allow empty string as valid but enforce that it cannot be null or undefined
        return value !== undefined && value !== null;
      },
      message: "Password is required"
    }
  })
  password: string;

  @Field({ nullable: true })
  @Prop({ required: false })
  avatar?: string;

  @Field(() => UserType)
  @Prop({ enum: UserType, default: UserType.User })
  type: UserType;

  @Field(() => Boolean)
  @Prop({ type: Boolean, required: true, default: false })
  isDeleted: boolean;

  @Field(() => Number, { nullable: true })
  matcherCount?: number;

  @Field(() => Number, { nullable: true })
  matcheeCount?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserModel: ModelDefinition = {
  name: User.name,
  schema: UserSchema
};

UserSchema.statics.findByIdentity = async function (
  identity: string,
  projection?: ProjectionType<User>
) {
  return await this.findOne(
    {
      $and: [
        {
          $or: [
            { email: identity },
            { username: identity },
            { phoneNumber: identity }
          ]
        },
        { isDeleted: false }
      ]
    },
    projection
  );
};

UserSchema.statics.existsByIdentity = async function (identity: string) {
  return await this.exists({
    $and: [
      {
        $or: [
          { email: identity },
          { username: identity },
          { phoneNumber: identity }
        ]
      },
      { isDeleted: false }
    ]
  });
};

UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && Boolean(this.get("password"))) {
    const password = await encryptionService.hash(this.get("password"));

    this.set("password", password);
  }

  next();
});

//Checking for unique keys when you have multiple indexes
UserSchema.post("save", function (error, doc, next) {
  if (error?.name === "MongoServerError" && (error as any)?.code === 11000) {
    return next(new ConflictException(UserName_Already_Exists_Message));
  }

  next();
} as ErrorHandlingMiddlewareFunction<User>);

export interface UserRepository extends Model<User> {
  findByIdentity(
    identity: string,
    projection?: ProjectionType<User>
  ): Promise<User | null>;

  existsByIdentity(identity: string): Promise<{ _id: any } | null>;
}
