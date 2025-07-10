import { Module } from "@nestjs/common";
import { UserService } from "./services/user.service";
import { UserResolver } from "./resolvers/user.resolver";
import { SharedModule } from "../shared/shared.module";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModel } from "./models/user.model";

@Module({
  providers: [UserResolver, UserService],
  imports: [SharedModule, MongooseModule.forFeature([UserModel])]
})
export class UserModule {}
