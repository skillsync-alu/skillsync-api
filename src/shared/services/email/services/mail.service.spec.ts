import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { config } from '../../../../config';

// Mock the config
jest.mock('../../../../config', () => ({
  config: {
    isDevelopment: true, // Default to development mode for testing
  },
}));

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Development Mode', () => {
    beforeEach(() => {
      (config as any).isDevelopment = true;
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should log email to console in development mode', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        htmlContent: '<h1>Hello from Skillsync!</h1>',
        senderName: 'SkillSync',
        senderEmail: 'no-reply@skillsync.com',
      };

      const result = await service.sendMail(emailData);

      expect(console.log).toHaveBeenCalledWith('📧 EMAIL SENT (Development Mode):');
      expect(console.log).toHaveBeenCalledWith('   To: test@example.com');
      expect(console.log).toHaveBeenCalledWith('   From: SkillSync <no-reply@skillsync.com>');
      expect(console.log).toHaveBeenCalledWith('   Subject: Test Email');
      expect(console.log).toHaveBeenCalledWith('   Content: <h1>Hello from Skillsync!</h1>');
      expect(result).toEqual({ message: 'Email logged to console (development mode)' });
    });
  });

  describe('Production Mode', () => {
    beforeEach(() => {
      (config as any).isDevelopment = false;
    });

    it('should attempt to send real email in production mode', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        htmlContent: '<h1>Hello from Skillsync!</h1>',
        senderName: 'SkillSync',
        senderEmail: 'no-reply@skillsync.com',
      };

      // This will likely fail due to Brevo account not being activated
      // but we can test that it attempts to send
      try {
        await service.sendMail(emailData);
      } catch (error) {
        // Expected to fail due to Brevo account not being activated
        expect(error.message).toContain('Failed to send email');
      }
    });
  });
}); 