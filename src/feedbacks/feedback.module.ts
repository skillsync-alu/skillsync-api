import { Module } from "@nestjs/common";
import { FeedbackService } from "./services/feedback.service";
import { FeedbackResolver } from "./resolvers/feedback.resolver";
import { MongooseModule } from "@nestjs/mongoose";
import { Feedbackmodel } from "./models/feedback.model";

@Module({
  exports: [FeedbackService],
  providers: [FeedbackResolver, FeedbackService],
  imports: [MongooseModule.forFeature([Feedbackmodel])]
})
export class FeedbackModule {}
