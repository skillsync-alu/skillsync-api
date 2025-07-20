import { Test, TestingModule } from "@nestjs/testing";
import { OtpService } from "./otp.service";
import { MailService } from "../shared/services/email/services/mail.service";

describe("OtpService", () => {
  let service: OtpService;
  let mailService: jest.Mocked<MailService>;

  beforeEach(async () => {
    const mockMailService = {
      sendMail: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: MailService,
          useValue: mockMailService
        }
      ]
    }).compile();

    service = module.get<OtpService>(OtpService);
    mailService = module.get(MailService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("generateAndSendOtp", () => {
    it("should generate OTP and send email", async () => {
      const identifier = "test@example.com";
      mailService.sendMail.mockResolvedValue({} as any);

      const result = await service.generateAndSendOtp(identifier);

      expect(result).toBe(true);
      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: identifier,
        subject: "Your OTP Code",
        htmlContent: expect.stringContaining("Your OTP code is:"),
        senderName: "SkillSync",
        senderEmail: "no-reply@skillsync.com"
      });
    });
  });

  describe("verifyOtp", () => {
    it("should verify valid OTP", async () => {
      const identifier = "test@example.com";
      mailService.sendMail.mockResolvedValue({} as any);
      await service.generateAndSendOtp(identifier);
      // Get the actual code that was generated
      const store = (service as any).otpStore as Map<
        string,
        { identifier: string; expiresAt: number }
      >;
      const [[code]] = Array.from(store.entries());
      const result = await service.verifyOtp(code);
      expect(result).toBe(identifier);
    });

    it("should reject invalid OTP", async () => {
      const invalidCode = "999999";
      const result = await service.verifyOtp(invalidCode);
      expect(result).toBeNull();
    });

    it("should reject expired OTP", async () => {
      const identifier = "test@example.com";
      mailService.sendMail.mockResolvedValue({} as any);
      await service.generateAndSendOtp(identifier);
      // Manually expire the OTP by manipulating the store
      const store = (service as any).otpStore as Map<
        string,
        { identifier: string; expiresAt: number }
      >;
      const [[code, record]] = Array.from(store.entries());
      record.expiresAt = Date.now() - 1000; // Expire it
      const result = await service.verifyOtp(code);
      expect(result).toBeNull();
    });
  });
});
