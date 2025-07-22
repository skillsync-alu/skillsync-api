import { registerEnumType } from "@nestjs/graphql";

export enum FeedbackUserType {
  Matcher = "Matcher",
  Matchee = "Matchee"
}

registerEnumType(FeedbackUserType, {
  name: "FeedbackUserType"
});
