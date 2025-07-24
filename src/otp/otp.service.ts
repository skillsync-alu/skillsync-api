import { Injectable } from "@nestjs/common";
import { MailService } from "../shared/services/email/services/mail.service";

/**
 * Service for handling One-Time Password (OTP) generation, storage, and verification.
 * Responsible for sending OTP codes via email and verifying them.
 */
@Injectable()
export class OtpService {
  /**
   * In-memory store for OTP codes, mapping code to identifier and expiry timestamp.
   * Key: OTP code (string)
   * Value: { identifier: string; expiresAt: number }
   */
  private otpStore = new Map<
    string,
    { identifier: string; expiresAt: number }
  >();

  /**
   * OTP expiry duration in milliseconds (default: 5 minutes).
   */
  private OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly mailService: MailService) {}

  /**
   * Generates a new OTP code, stores it with the identifier, and sends it via email.
   * @param identifier - The recipient's email or unique identifier.
   * @returns Promise resolving to true if email sent successfully, false otherwise.
   */
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

  /**
   * Verifies an OTP code. If valid and not expired, returns the associated identifier.
   * @param code - The OTP code to verify.
   * @returns The identifier if valid, or null if invalid/expired.
   */
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

  /**
   * Generates a random 6-digit OTP code as a string.
   * @returns A 6-digit OTP code.
   */
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
