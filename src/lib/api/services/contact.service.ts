/**
 * Contact Service
 * Handles contact form submissions and related API operations
 */

import { apiClient } from "../client";

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

export interface ContactSubmissionResponse {
  id: string;
  status: string;
  message: string;
}

export class ContactService {
  /**
   * Submit a contact form
   */
  static async submitContactForm(data: ContactFormData): Promise<ContactSubmissionResponse> {
    try {
      const response = await apiClient.post<ContactSubmissionResponse>(
        "/api/contact",
        data
      );
      return response;
    } catch (error) {
      console.error("ContactService.submitContactForm error:", error);
      throw error;
    }
  }
}

export default ContactService;
