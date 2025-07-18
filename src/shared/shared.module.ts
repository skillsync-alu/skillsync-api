import { Logger, Module } from "@nestjs/common";
import { EncryptionService } from "./services/encryption/services/encryption.service";
import { JwtModule } from "@nestjs/jwt";
import { config } from "../config/index";
import { PaginationService } from "./services/pagination/services/pagination.service";
import { MessageService } from "./services/messages/services/message.service";
import { MailService } from "./services/email/services/mail.service";

@Module({
  exports: [EncryptionService, PaginationService, MessageService, MailService],
  providers: [Logger, EncryptionService, PaginationService, MessageService, MailService],
  imports: [JwtModule.register({ secret: config.tokenization.secret })]
})
export class SharedModule {}
