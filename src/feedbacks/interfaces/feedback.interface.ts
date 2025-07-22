import { registerEnumType } from "@nestjs/graphql";

export enum FeedbackUserType {
  Matcher = "matcher",
  Matchee = "matchee"
}

registerEnumType(FeedbackUserType, {
  name: "FeedbackUserType"
});
