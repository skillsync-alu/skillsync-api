import { Module } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { OtpResolver } from "./otp.resolver";
import { SharedModule } from "../shared/shared.module";

/**
 * OTP Module
 * Provides OTP service and resolver for handling OTP generation and verification.
 */
@Module({
  exports: [OtpService],
  imports: [SharedModule],
  providers: [OtpResolver, OtpService]
})
export class OtpModule {}
