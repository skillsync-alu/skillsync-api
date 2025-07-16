import { Field, InputType } from "@nestjs/graphql";
import { FilterInput } from "../../shared/services/pagination/inputs/filter.input";
import { MatchStatusType } from "../interfaces/match.interface";

@InputType()
export class MatchFilterInput extends FilterInput {
  @Field(() => MatchStatusType, { defaultValue: MatchStatusType.Confirmed })
  status?: MatchStatusType;
}
