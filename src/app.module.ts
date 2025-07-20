import { MongooseModule } from "@nestjs/mongoose";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver } from "@nestjs/apollo";
import { config } from "./config";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./users/user.module";
import { SharedModule } from "./shared/shared.module";
import { AuthenticationModule } from "./authentication/authentication.module";
import { MatchModule } from "./matches/match.module";
import { StarModule } from "./stars/star.module";
import { ScheduleModule } from "@nestjs/schedule";
import { OtpModule } from './otp/otp.module';

const GraphQLModules = [
  UserModule,
  StarModule,
  MatchModule,
  SharedModule,
  AuthenticationModule,
  OtpModule
];

const ServerModules = [
  MongooseModule.forRoot(config.database.uri),
  GraphQLModule.forRoot({
    cors: {
      credentials: true,
      origin: true
    },
    debug: config.isLocal,
    playground: config.isLocal,
    autoSchemaFile: true,
    driver: ApolloDriver,
    include: GraphQLModules,
    fieldResolverEnhancers: ["guards"],
    context: ({ req, res }) => ({ req, res })
  }),
  ScheduleModule.forRoot()
];

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [...ServerModules, ...GraphQLModules, OtpModule]
})
export class AppModule {}
