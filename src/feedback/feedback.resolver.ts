import { Resolver } from "@nestjs/graphql";
import { FeedbackService } from "./feedback.service";

@Resolver()
export class FeedbackResolver {
  constructor(private readonly feedbackService: FeedbackService) {}
}
