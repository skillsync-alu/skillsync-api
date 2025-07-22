import * as SibApiV3Sdk from "sib-api-v3-sdk";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  private readonly apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY;
    console.log(
      "🔑 Brevo API Key (first 10 chars):",
      apiKey ? apiKey.substring(0, 10) + "..." : "NOT SET"
    );

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    defaultClient.authentications["api-key"].apiKey = apiKey;
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
    console.log("📧 Attempting to send email:");
    console.log("   To:", to);
    console.log("   From:", senderName, "<" + senderEmail + ">");
    console.log("   Subject:", subject);

    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.sender = { name: senderName, email: senderEmail };
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;

      console.log("📤 Sending to Brevo...");
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log("✅ Email sent successfully:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to send email:", error.message);
      console.error("❌ Full error:", error);
      throw error;
    }
  }
}
