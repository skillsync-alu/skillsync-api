import { Injectable } from "@nestjs/common";
import { MailService } from "../shared/services/email/services/mail.service";

@Injectable()
export class OtpService {
  // Store OTPs by code, with identifier and expiry
  private otpStore = new Map<
    string,
    { identifier: string; expiresAt: number }
  >();
  private OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly mailService: MailService) {}

  async generateAndSendOtp(identifier: string): Promise<boolean> {
    const code = this.generateOtpCode();
    const expiresAt = Date.now() + this.OTP_EXPIRY_MS;
    this.otpStore.set(code, { identifier, expiresAt });

    try {
      await this.mailService.sendMail({
        to: identifier,
        subject: "Your OTP Code",
        htmlContent: `<p>Your OTP code is: <b>${code}</b></p>`,
        senderName: "SkillSync",
        senderEmail: "difebi14@gmail.com" // Use your verified email
      });
      return true;
    } catch (error) {
      console.error("Failed to send OTP email:", error.message);
      this.otpStore.delete(code); // Clean up if sending fails
      return false;
    }
  }

  // Now only receives code, and derives identifier from store
  async verifyOtp(code: string): Promise<string | null> {
    const record = this.otpStore.get(code);
    if (!record) return null;
    if (record.expiresAt < Date.now()) {
      this.otpStore.delete(code);
      return null;
    }
    this.otpStore.delete(code);
    return record.identifier;
  }

  // Generate a random 6-digit code
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
