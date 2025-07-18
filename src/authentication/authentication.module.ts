import { Logger, Module } from "@nestjs/common";
import { AuthenticationService } from "./services/authentication.service";
import { AuthenticationResolver } from "./resolvers/authentication.resolver";
import { SharedModule } from "../shared/shared.module";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModel } from "../users/models/user.model";
import { AuthenticationStrategy } from "./strategies/authentication.strategy";

@Module({
  providers: [
    Logger,
    AuthenticationService,
    AuthenticationResolver,
    AuthenticationStrategy
  ],
  imports: [SharedModule, MongooseModule.forFeature([UserModel])]
})
export class AuthenticationModule {}
