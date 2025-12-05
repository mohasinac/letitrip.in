/**
 * @fileoverview Service Module
 * @module src/services/otp.service
 * @description This file contains service functions for otp operations
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * Send O T P Response interface
 * @interface SendOTPResponse
 */
export interface SendOTPResponse {
  /** Success */
  success: boolean;
  /** Message */
  message?: string;
  /** Otp Id */
  otpId?: string;
  /** Expires At */
  expiresAt?: string;
  /** Already Verified */
  alreadyVerified?: boolean;
  /** Error */
  error?: string;
}

/**
 * VerifyOTPResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for VerifyOTPResponse
 */
export interface VerifyOTPResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Error */
  error?: string;
}

/**
 * OTPClientService class
 * 
 * @class
 * @description Description of OTPClientService class functionality
 */
class OTPClientService {
  /**
   * Send OTP - generic method
   */
  async sendOTP(params: {
    /** User Id */
    userId: string;
    /** Type */
    type: "email" | "phone";
    /** Destination */
    destination: string;
  }): Promise<any> {
    if (params.type === "email") {
      return await this.sendEmailOTP();
    } else {
      return await this.sendPhoneOTP();
    }
  }

  /**
   * Verify OTP - generic method
   */
  async verifyOTP(params: {
    /** User Id */
    userId: string;
    /** Type */
    type: "email" | "phone";
    /** Destination */
    destination: string;
    /** Otp */
    otp: string;
  }): Promise<VerifyOTPResponse> {
    if (params.type === "email") {
      return await this.verifyEmailOTP(params.otp);
    } else {
      return await this.verifyPhoneOTP(params.otp);
    }
  }

  /**
   * Check if user verification is complete
   */
  async isVerified(userId: string, type: "email" | "phone"): Promise<boolean> {
    if (type === "email") {
      return await this.isEmailVerified();
    } else {
      return await this.isPhoneVerified();
    }
  }

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
