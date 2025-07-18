import { MatchStatusType } from "../interfaces/match.interface";

export const matchStatusMessages: Record<MatchStatusType, string> = {
  [MatchStatusType.Deleted]: "This Match has been deleted",
  [MatchStatusType.Confirmed]: "This Match has been confirmed!",
  [MatchStatusType.AcceptedByStudent]:
    "This Match has been accepted by the student!",
  [MatchStatusType.AcceptedByTutor]:
    "This Match has been accepted by the tutor!",
  [MatchStatusType.RejectedByStudent]:
    "This Match has been rejected by the student!",
  [MatchStatusType.RejectedByTutor]:
    "This Match has been rejected by the tutor!",
  [MatchStatusType.Draft]:
    "This Match has been created and is currently in draft"
};
