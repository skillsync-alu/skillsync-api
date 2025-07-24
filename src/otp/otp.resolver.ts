import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { OtpService } from "./otp.service";
import { ForgotPasswordInput } from "../authentication/inputs/forgot-password.input";
import { VerifyOtpInput } from "../authentication/inputs/verify-otp.input";

/**
 * GraphQL resolver for OTP-related mutations (request and verify OTP).
 */
@Resolver()
export class OtpResolver {
  constructor(private readonly otpService: OtpService) {}

  /**
   * Mutation to request an OTP to be sent to the provided identifier (e.g., email).
   * @param input - Contains the identifier to which the OTP should be sent.
   * @returns True if OTP was sent successfully, false otherwise.
   */
  @Mutation(() => Boolean)
  async requestOtp(
    @Args("input") input: ForgotPasswordInput
  ): Promise<boolean> {
    return this.otpService.generateAndSendOtp(input.identifier);
  }

  /**
   * Mutation to verify an OTP code.
   * @param input - Contains the OTP code to verify.
   * @returns True if OTP is valid, false otherwise.
   */
  @Mutation(() => Boolean)
  async verifyOtp(@Args("input") input: VerifyOtpInput): Promise<boolean> {
    return Boolean(this.otpService.verifyOtp(input.code));
  }
}
