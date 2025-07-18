import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { OtpService } from './otp.service';
import { ForgotPasswordInput } from '../authentication/inputs/forgot-password.input';
import { VerifyOtpInput } from '../authentication/inputs/verify-otp.input';

@Resolver()
export class OtpResolver {
  constructor(private readonly otpService: OtpService) {}

  @Mutation(() => Boolean)
  async requestOtp(@Args('input') input: ForgotPasswordInput): Promise<boolean> {
    return this.otpService.generateAndSendOtp(input.identifier);
  }

  @Mutation(() => Boolean)
  async verifyOtp(@Args('input') input: VerifyOtpInput): Promise<boolean> {
    return this.otpService.verifyOtp(input.identifier, input.code);
  }
}
