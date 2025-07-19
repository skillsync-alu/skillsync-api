import { Injectable } from '@nestjs/common';
import { MailService } from '../shared/services/email/services/mail.service';

@Injectable()
export class OtpService {
  private otpStore = new Map<string, { code: string; expiresAt: number }>();
  private OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly mailService: MailService) {}

  async generateAndSendOtp(identifier: string): Promise<boolean> {
    const code = this.generateOtpCode();
    const expiresAt = Date.now() + this.OTP_EXPIRY_MS;
    this.otpStore.set(identifier, { code, expiresAt });
    
    try {
      await this.mailService.sendMail({
        to: identifier,
        subject: 'Your OTP Code',
        htmlContent: `<p>Your OTP code is: <b>${code}</b></p>`,
        senderName: 'SkillSync',
        senderEmail: 'no-reply@skillsync.com',
      });
      return true;
    } catch (error) {
      console.error('Failed to send OTP email:', error.message);
      return false;
    }
  }

  async verifyOtp(identifier: string, code: string): Promise<boolean> {
    const record = this.otpStore.get(identifier);
    if (!record) return false;
    if (record.expiresAt < Date.now()) {
      this.otpStore.delete(identifier);
      return false;
    }
    if (record.code !== code) return false;
    this.otpStore.delete(identifier);
    return true;
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  }
}
