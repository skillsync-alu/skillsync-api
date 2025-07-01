import { InputType, PartialType, OmitType, Field } from "@nestjs/graphql";
import { CreateUserInput } from "../../authentication/inputs/create-user.input";
import { FileInput } from "src/shared/inputs/file.input";
import { UserSocialsInput } from "./user-socials.input";

@InputType()
export class UpdateUserInput extends OmitType(PartialType(CreateUserInput), [
  "type",
  "referredBy"
]) {
  @Field({ nullable: true })
  pin?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  oldPin?: string;

  @Field(() => UserSocialsInput, { nullable: true })
  socials?: UserSocialsInput;

  @Field(() => Boolean, { nullable: true })
  shouldRemoveAvatar?: boolean;

  @Field(() => Boolean, { nullable: true })
  isBanned?: boolean;

  @Field(() => FileInput, { nullable: true })
  avatarInput?: FileInput;
}
