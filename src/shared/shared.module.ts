import { Logger, Module } from "@nestjs/common";
import { EncryptionService } from "./services/encryption/services/encryption.service";
import { JwtModule } from "@nestjs/jwt";
import { config } from "../config/index";
import { PaginationService } from "./services/pagination/services/pagination.service";

@Module({
  exports: [EncryptionService, PaginationService],
  providers: [Logger, EncryptionService, PaginationService],
  imports: [JwtModule.register({ secret: config.tokenization.secret })]
})
export class SharedModule {}
