import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";

@InputType()
export class UserSettingsInput {
  @Field({ nullable: true })
  @IsOptional()
  googleRefreshToken?: string;
}
