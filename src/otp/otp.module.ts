import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpResolver } from './otp.resolver';

@Module({
  providers: [OtpResolver, OtpService],
})
export class OtpModule {}
