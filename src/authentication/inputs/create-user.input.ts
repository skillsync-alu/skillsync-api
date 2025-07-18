import { InputType, Field } from "@nestjs/graphql";
import { IsAlphanumeric, IsEmail, IsEnum, IsOptional } from "class-validator";
import { UserType } from "../../users/interfaces/user.interface";
import { CountryCodeType } from "../../shared/constants/shared.constant";
import { CountryCode } from "libphonenumber-js";

@InputType()
export class CreateUserInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsAlphanumeric()
  username?: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  phoneNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  referredBy?: string;

  @Field(() => UserType, { nullable: true })
  @IsEnum(UserType, { message: "Please provide a valid user account type" })
  type?: UserType;

  @Field(() => CountryCodeType, { nullable: true })
  phoneCode?: CountryCode;
}
