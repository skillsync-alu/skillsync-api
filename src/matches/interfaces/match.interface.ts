import { registerEnumType } from "@nestjs/graphql";

export enum MatchStatusType {
  Draft = "Draft",
  Deleted = "Deleted",
  RejectedByStudent = "RejectedByStudent",
  RejectedByTutor = "RejectedByTutor",
  AcceptedByStudent = "AcceptedByStudent",
  AcceptedByTutor = "AcceptedByTutor",
  Confirmed = "Confirmed"
}

registerEnumType(MatchStatusType, {
  name: "MatchStatusType",
  description: "Match Status Types"
});
