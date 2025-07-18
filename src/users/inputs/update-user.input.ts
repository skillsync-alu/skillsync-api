import { InputType, PartialType, OmitType, Field } from "@nestjs/graphql";
import { CreateUserInput } from "../../authentication/inputs/create-user.input";
import { FileInput } from "../../shared/inputs/file.input";

@InputType()
export class UpdateUserInput extends OmitType(PartialType(CreateUserInput), [
  "type",
  "referredBy"
]) {
  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  oldPin?: string;

  @Field(() => Boolean, { nullable: true })
  shouldRemoveAvatar?: boolean;

  @Field(() => FileInput, { nullable: true })
  avatarInput?: FileInput;

  @Field(() => [String], { nullable: true })
  skillsOfferred?: string[];

  @Field(() => [String], { nullable: true })
  skillsWanted?: string[];
}
