import { Module } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { UserResolver } from "./resolvers/user.resolver";
import { SharedModule } from "../shared/shared.module";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModel } from "./models/user.model";
import { MatchModule } from "../matches/match.module";
import { StarModule } from "../stars/star.module";

@Module({
  providers: [UserResolver, UserService],
  imports: [
    StarModule,
    MatchModule,
    SharedModule,
    MongooseModule.forFeature([UserModel])
  ]
})
export class UserModule {}
