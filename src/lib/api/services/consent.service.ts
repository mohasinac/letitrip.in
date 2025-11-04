/**
 * Consent Service
 * Handles cookie consent and privacy-related API operations
 */

import { apiClient } from "../client";

export interface ConsentData {
  userId?: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: string;
}

export interface ConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export class ConsentService {
  /**
   * Save user consent preferences
   */
  static async saveConsent(settings: ConsentSettings): Promise<ConsentData> {
    try {
      const response = await apiClient.post<ConsentData>(
        "/api/consent",
        settings
      );
      return response;
    } catch (error) {
      console.error("ConsentService.saveConsent error:", error);
      throw error;
    }
  }

  /**
   * Get user consent preferences
   */
  static async getConsent(): Promise<ConsentData | null> {
    try {
      const response = await apiClient.get<ConsentData>("/api/consent");
      return response;
    } catch (error) {
      console.error("ConsentService.getConsent error:", error);
      return null;
    }
  }

  /**
   * Update consent preferences
   */
  static async updateConsent(settings: Partial<ConsentSettings>): Promise<ConsentData> {
    try {
      const response = await apiClient.patch<ConsentData>(
        "/api/consent",
        settings
      );
      return response;
    } catch (error) {
      console.error("ConsentService.updateConsent error:", error);
      throw error;
    }
  }
}

export default ConsentService;
