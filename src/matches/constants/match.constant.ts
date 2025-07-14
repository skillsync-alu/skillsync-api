import { MatchStatusType } from "../interfaces/match.interface";

export const matchStatusMessages: Record<MatchStatusType, string> = {
  [MatchStatusType.Deleted]: "This Match has been deleted",
  [MatchStatusType.Confirmed]: "This Match has been confirmed!",
  [MatchStatusType.Rejected]: "This Match has been rejected!",
  [MatchStatusType.Draft]:
    "This Match has been created and is currently in draft"
};
