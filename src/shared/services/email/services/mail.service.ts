import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { Injectable } from "@nestjs/common";
import { config } from "../../../../config";

@Injectable()
export class MailService {
  private readonly apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY;
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    defaultClient.authentications['api-key'].apiKey = apiKey;
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendMail({
    to,
    subject,
    htmlContent,
    senderName,
    senderEmail
  }: {
    to: string;
    subject: string;
    htmlContent: string;
    senderName: string;
    senderEmail: string;
  }): Promise<any> {
    if (config.isDevelopment) {
      // In development, just log the email instead of sending it
      console.log(`📧 EMAIL SENT (Development Mode):`);
      console.log(`   To: ${to}`);
      console.log(`   From: ${senderName} <${senderEmail}>`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Content: ${htmlContent}`);
      console.log(`   ---`);
      return { message: 'Email logged to console (development mode)' };
    }

    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.sender = { name: senderName, email: senderEmail };
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      return this.apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Failed to send email:', error.message);
      throw error;
    }
  }
}