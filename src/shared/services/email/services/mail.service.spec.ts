import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';

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

  it('should send an email', async () => {
    const result = await service.sendMail({
      to: 'difepeters@gmail.com',
      subject: 'Test Email',
      htmlContent: '<h1>Hello from Skillsync!</h1>',
      senderName: 'EbiTech',
      senderEmail: 'difebi14@gmail.com',
    });
    expect(result).toBeDefined();
    // Optionally, check result.messageId or status
  });
}); 