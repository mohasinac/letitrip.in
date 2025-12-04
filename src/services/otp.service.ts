import { apiService } from "./api.service";

/**
 * OTP Client Service - Frontend Only
 * Calls backend API routes for email/phone verification
 *
 * Features:
 * - Send OTP via email/SMS
 * - Verify OTP codes
 * - Check verification status
 * - Rate limiting handled by backend
 */

export interface SendOTPResponse {
  success: boolean;
  message?: string;
  otpId?: string;
  expiresAt?: string;
  alreadyVerified?: boolean;
  error?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  error?: string;
}

class OTPClientService {
  /**
   * Send OTP to user's email
   */
  async sendEmailOTP(): Promise<SendOTPResponse> {
    return await apiService.post<SendOTPResponse>(
      "/api/auth/verify-email/send",
      {}
    );
  }

  /**
   * Verify email OTP
   */
  async verifyEmailOTP(otp: string): Promise<VerifyOTPResponse> {
    return await apiService.post<VerifyOTPResponse>(
      "/api/auth/verify-email/verify",
      { otp }
    );
  }

  /**
   * Send OTP to user's phone
   */
  async sendPhoneOTP(): Promise<SendOTPResponse> {
    return await apiService.post<SendOTPResponse>(
      "/api/auth/verify-phone/send",
      {}
    );
  }

  /**
   * Verify phone OTP
   */
  async verifyPhoneOTP(otp: string): Promise<VerifyOTPResponse> {
    return await apiService.post<VerifyOTPResponse>(
      "/api/auth/verify-phone/verify",
      { otp }
    );
  }

  /**
   * Check if user's email is verified
   */
  async isEmailVerified(): Promise<boolean> {
    try {
      const response = await apiService.get<{ verified: boolean }>(
        "/api/auth/verify-email/status"
      );
      return response.verified;
    } catch {
      return false;
    }
  }

  /**
   * Check if user's phone is verified
   */
  async isPhoneVerified(): Promise<boolean> {
    try {
      const response = await apiService.get<{ verified: boolean }>(
        "/api/auth/verify-phone/status"
      );
      return response.verified;
    } catch {
      return false;
    }
  }
}

export const otpService = new OTPClientService();
