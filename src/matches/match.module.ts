import { Module } from "@nestjs/common";
import { MatchService } from "./services/match.service";
import { MatchResolver } from "./resolvers/match.resolver";
import { SharedModule } from "../shared/shared.module";
import { MongooseModule } from "@nestjs/mongoose";
import { MatchModel } from "./models/match.model";
import { UserModel } from "../users/models/user.model";
import { StarModel } from "../stars/models/star.model";

@Module({
  exports: [MatchService],
  providers: [MatchResolver, MatchService],
  imports: [
    SharedModule,
    MongooseModule.forFeature([MatchModel, UserModel, StarModel])
  ]
})
export class MatchModule {}
