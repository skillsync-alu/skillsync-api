import { registerEnumType } from "@nestjs/graphql";

export enum MatchStatusType {
  Draft = "Draft",
  Deleted = "Deleted",
  Rejected = "Rejected",
  Confirmed = "Confirmed"
}

registerEnumType(MatchStatusType, {
  name: "MatchStatusType",
  description: "Match Status Types"
});
