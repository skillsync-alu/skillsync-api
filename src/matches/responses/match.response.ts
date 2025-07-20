import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "../../shared/services/pagination/responses/pagination.response";
import { Match } from "../models/match.model";

@ObjectType()
export class MatchResponse extends PaginationResponse<Match> {
  @Field(() => [Match])
  list: Match[];
}
