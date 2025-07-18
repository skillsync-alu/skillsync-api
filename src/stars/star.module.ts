import { Module } from "@nestjs/common";
import { StarService } from "./services/star.service";
import { StarResolver } from "./resolvers/star.resolver";
import { MongooseModule } from "@nestjs/mongoose";
import { StarModel } from "./models/star.model";
import { SharedModule } from "../shared/shared.module";
import { UserModel } from "../users/models/user.model";
import { MatchModel } from "../matches/models/match.model";

@Module({
  exports: [StarService],
  providers: [StarResolver, StarService],
  imports: [
    SharedModule,
    MongooseModule.forFeature([UserModel, StarModel, MatchModel])
  ]
})
export class StarModule {}
