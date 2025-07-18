import { Resolver } from '@nestjs/graphql';
import { OtpService } from './otp.service';

@Resolver()
export class OtpResolver {
  constructor(private readonly otpService: OtpService) {}
}
