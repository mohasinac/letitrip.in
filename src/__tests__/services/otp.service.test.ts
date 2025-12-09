/**
 * OTP Service Unit Tests
 * Tests email and phone verification OTP functionality
 */

import { apiService } from "@/services/api.service";
import {
  otpService,
  type SendOTPResponse,
  type VerifyOTPResponse,
} from "@/services/otp.service";

jest.mock("@/services/api.service");

describe("OTPClientService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendOTP (generic)", () => {
    it("should send email OTP when type is email", async () => {
      const mockResponse: SendOTPResponse = {
        success: true,
        message: "OTP sent",
        otpId: "otp-123",
        expiresAt: "2025-12-09T12:00:00Z",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.sendOTP({
        userId: "user-1",
        type: "email",
        destination: "user@example.com",
      });

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-email/send",
        {}
      );
    });

    it("should send phone OTP when type is phone", async () => {
      const mockResponse: SendOTPResponse = {
        success: true,
        message: "OTP sent",
        otpId: "otp-456",
        expiresAt: "2025-12-09T12:00:00Z",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.sendOTP({
        userId: "user-1",
        type: "phone",
        destination: "+919876543210",
      });

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-phone/send",
        {}
      );
    });

    it("should handle already verified users", async () => {
      const mockResponse: SendOTPResponse = {
        success: false,
        alreadyVerified: true,
        message: "Already verified",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.sendOTP({
        userId: "user-1",
        type: "email",
        destination: "user@example.com",
      });

      expect(result.success).toBe(false);
      expect(result.alreadyVerified).toBe(true);
    });
  });

  describe("verifyOTP (generic)", () => {
    it("should verify email OTP when type is email", async () => {
      const mockResponse: VerifyOTPResponse = {
        success: true,
        message: "Email verified successfully",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyOTP({
        userId: "user-1",
        type: "email",
        destination: "user@example.com",
        otp: "123456",
      });

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-email/verify",
        {
          otp: "123456",
        }
      );
    });

    it("should verify phone OTP when type is phone", async () => {
      const mockResponse: VerifyOTPResponse = {
        success: true,
        message: "Phone verified successfully",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyOTP({
        userId: "user-1",
        type: "phone",
        destination: "+919876543210",
        otp: "654321",
      });

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-phone/verify",
        {
          otp: "654321",
        }
      );
    });

    it("should handle invalid OTP", async () => {
      const mockResponse: VerifyOTPResponse = {
        success: false,
        message: "Invalid OTP",
        error: "OTP_INVALID",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyOTP({
        userId: "user-1",
        type: "email",
        destination: "user@example.com",
        otp: "000000",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("OTP_INVALID");
    });

    it("should handle expired OTP", async () => {
      const mockResponse: VerifyOTPResponse = {
        success: false,
        message: "OTP expired",
        error: "OTP_EXPIRED",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyOTP({
        userId: "user-1",
        type: "email",
        destination: "user@example.com",
        otp: "123456",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("OTP_EXPIRED");
    });
  });

  describe("isVerified (generic)", () => {
    it("should check email verification status", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ verified: true });

      const result = await otpService.isVerified("user-1", "email");

      expect(result).toBe(true);
      expect(apiService.get).toHaveBeenCalledWith(
        "/api/auth/verify-email/status"
      );
    });

    it("should check phone verification status", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ verified: false });

      const result = await otpService.isVerified("user-1", "phone");

      expect(result).toBe(false);
      expect(apiService.get).toHaveBeenCalledWith(
        "/api/auth/verify-phone/status"
      );
    });
  });

  describe("sendEmailOTP", () => {
    it("should send OTP to email", async () => {
      const mockResponse: SendOTPResponse = {
        success: true,
        message: "OTP sent to email",
        otpId: "otp-email-1",
        expiresAt: "2025-12-09T12:05:00Z",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.sendEmailOTP();

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-email/send",
        {}
      );
    });

    it("should handle rate limiting", async () => {
      const mockResponse: SendOTPResponse = {
        success: false,
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Try again later.",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.sendEmailOTP();

      expect(result.success).toBe(false);
      expect(result.error).toBe("RATE_LIMIT_EXCEEDED");
    });

    it("should handle network errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(otpService.sendEmailOTP()).rejects.toThrow("Network error");
    });
  });

  describe("verifyEmailOTP", () => {
    it("should verify valid email OTP", async () => {
      const mockResponse: VerifyOTPResponse = {
        success: true,
        message: "Email verified",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyEmailOTP("123456");

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-email/verify",
        {
          otp: "123456",
        }
      );
    });

    it("should handle wrong OTP", async () => {
      const mockResponse: VerifyOTPResponse = {
        success: false,
        message: "Invalid OTP",
        error: "INVALID_OTP",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyEmailOTP("999999");

      expect(result.success).toBe(false);
    });

    it("should handle empty OTP", async () => {
      const mockResponse: VerifyOTPResponse = {
        success: false,
        message: "OTP required",
        error: "OTP_REQUIRED",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyEmailOTP("");

      expect(result.success).toBe(false);
    });
  });

  describe("sendPhoneOTP", () => {
    it("should send OTP to phone", async () => {
      const mockResponse: SendOTPResponse = {
        success: true,
        message: "OTP sent to phone",
        otpId: "otp-phone-1",
        expiresAt: "2025-12-09T12:05:00Z",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.sendPhoneOTP();

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-phone/send",
        {}
      );
    });

    it("should handle invalid phone number", async () => {
      const mockResponse: SendOTPResponse = {
        success: false,
        error: "INVALID_PHONE",
        message: "Invalid phone number",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.sendPhoneOTP();

      expect(result.success).toBe(false);
      expect(result.error).toBe("INVALID_PHONE");
    });
  });

  describe("verifyPhoneOTP", () => {
    it("should verify valid phone OTP", async () => {
      const mockResponse: VerifyOTPResponse = {
        success: true,
        message: "Phone verified",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyPhoneOTP("654321");

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-phone/verify",
        {
          otp: "654321",
        }
      );
    });

    it("should handle max attempts exceeded", async () => {
      const mockResponse: VerifyOTPResponse = {
        success: false,
        message: "Too many attempts",
        error: "MAX_ATTEMPTS_EXCEEDED",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyPhoneOTP("111111");

      expect(result.success).toBe(false);
      expect(result.error).toBe("MAX_ATTEMPTS_EXCEEDED");
    });
  });

  describe("isEmailVerified", () => {
    it("should return true when email is verified", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ verified: true });

      const result = await otpService.isEmailVerified();

      expect(result).toBe(true);
    });

    it("should return false when email is not verified", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ verified: false });

      const result = await otpService.isEmailVerified();

      expect(result).toBe(false);
    });

    it("should return false on API error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API error"));

      const result = await otpService.isEmailVerified();

      expect(result).toBe(false);
    });

    it("should handle unauthenticated requests", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Unauthorized")
      );

      const result = await otpService.isEmailVerified();

      expect(result).toBe(false);
    });
  });

  describe("isPhoneVerified", () => {
    it("should return true when phone is verified", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ verified: true });

      const result = await otpService.isPhoneVerified();

      expect(result).toBe(true);
    });

    it("should return false when phone is not verified", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ verified: false });

      const result = await otpService.isPhoneVerified();

      expect(result).toBe(false);
    });

    it("should return false on API error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await otpService.isPhoneVerified();

      expect(result).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle malformed API responses", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        // Missing success field
        message: "Something",
      });

      const result = await otpService.sendEmailOTP();

      expect(result).toBeDefined();
    });

    it("should handle concurrent OTP requests", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        message: "OTP sent",
      });

      const promises = [otpService.sendEmailOTP(), otpService.sendPhoneOTP()];

      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it("should handle special characters in OTP", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: false,
        message: "Invalid OTP format",
      });

      const result = await otpService.verifyEmailOTP("12@#45");

      expect(result.success).toBe(false);
    });

    it("should handle very long OTP strings", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: false,
        message: "Invalid OTP",
      });

      const longOTP = "1".repeat(100);
      const result = await otpService.verifyEmailOTP(longOTP);

      expect(result.success).toBe(false);
    });

    it("should handle rapid verification attempts", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: false,
        error: "RATE_LIMIT",
      });

      const promises = Array(10)
        .fill(null)
        .map(() => otpService.verifyEmailOTP("123456"));

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.success).toBe(false);
      });
    });
  });

  describe("OTP Workflow", () => {
    it("should complete full email verification workflow", async () => {
      // Step 1: Check status - not verified
      (apiService.get as jest.Mock).mockResolvedValue({ verified: false });
      let verified = await otpService.isEmailVerified();
      expect(verified).toBe(false);

      // Step 2: Send OTP
      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        otpId: "otp-1",
      });
      const sendResult = await otpService.sendEmailOTP();
      expect(sendResult.success).toBe(true);

      // Step 3: Verify OTP
      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        message: "Verified",
      });
      const verifyResult = await otpService.verifyEmailOTP("123456");
      expect(verifyResult.success).toBe(true);

      // Step 4: Check status - now verified
      (apiService.get as jest.Mock).mockResolvedValue({ verified: true });
      verified = await otpService.isEmailVerified();
      expect(verified).toBe(true);
    });

    it("should handle failed verification and retry", async () => {
      // First attempt - wrong OTP
      (apiService.post as jest.Mock).mockResolvedValue({
        success: false,
        error: "INVALID_OTP",
      });
      let result = await otpService.verifyEmailOTP("000000");
      expect(result.success).toBe(false);

      // Second attempt - correct OTP
      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        message: "Verified",
      });
      result = await otpService.verifyEmailOTP("123456");
      expect(result.success).toBe(true);
    });

    it("should handle OTP expiry and resend", async () => {
      // First OTP expired
      (apiService.post as jest.Mock).mockResolvedValue({
        success: false,
        error: "OTP_EXPIRED",
      });
      let result = await otpService.verifyEmailOTP("123456");
      expect(result.success).toBe(false);

      // Resend OTP
      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        otpId: "otp-2",
      });
      const sendResult = await otpService.sendEmailOTP();
      expect(sendResult.success).toBe(true);

      // Verify new OTP
      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        message: "Verified",
      });
      result = await otpService.verifyEmailOTP("654321");
      expect(result.success).toBe(true);
    });
  });
});
