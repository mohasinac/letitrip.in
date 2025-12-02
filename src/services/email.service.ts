/**
 * Email Service (Frontend)
 * 
 * Service for sending emails from the UI
 * Calls the /api/email/send endpoint
 */

import { apiService } from "./api.service";
import { EMAIL_ROUTES } from "@/constants/api-routes";

interface SendEmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
}

class EmailServiceFrontend {
  /**
   * Send an email
   */
  async send(options: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      const response = await apiService.post<SendEmailResponse>(
        EMAIL_ROUTES.SEND,
        options
      );
      return response;
    } catch (error: any) {
      console.error("Email service error:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }
  }

  /**
   * Send test email (admin only)
   */
  async sendTest(to: string): Promise<SendEmailResponse> {
    try {
      const response = await apiService.post<SendEmailResponse>(
        EMAIL_ROUTES.TEST,
        { to }
      );
      return response;
    } catch (error: any) {
      console.error("Test email error:", error);
      return {
        success: false,
        error: error.message || "Failed to send test email",
      };
    }
  }
}

// Export singleton instance
export const emailServiceFrontend = new EmailServiceFrontend();
