import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UserSocialsInput {
  @Field({ nullable: true })
  twitter?: string;
}
