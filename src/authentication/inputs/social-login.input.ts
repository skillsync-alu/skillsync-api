import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsOptional } from "class-validator";
import { SocialLoginType } from "../interfaces/authentication.interface";
import { UserType } from "../../users/interfaces/user.interface";

@InputType()
export class SocialLoginInput {
  @Field(() => SocialLoginType)
  @IsEnum(SocialLoginType, {
    message: "Please provide a valid social login type"
  })
  type: SocialLoginType;

  @Field(() => UserType, { nullable: true })
  @IsOptional()
  @IsEnum(UserType, {
    message: "Please provide a valid user type"
  })
  userType?: UserType;

  @Field({ nullable: true })
  @IsOptional()
  token?: string;
}
