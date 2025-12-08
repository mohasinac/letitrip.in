import { apiService } from "../api.service";
import { otpService } from "../otp.service";

jest.mock("../api.service", () => ({
  apiService: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe("OTPService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendEmailOTP", () => {
    it("should send email OTP", async () => {
      const mockResponse = {
        success: true,
        message: "OTP sent successfully",
        otpId: "otp_123",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.sendEmailOTP();

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-email/send",
        {}
      );
      expect(result.success).toBe(true);
    });

    it("should handle errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(otpService.sendEmailOTP()).rejects.toThrow("Network error");
    });
  });

  describe("verifyEmailOTP", () => {
    it("should verify email OTP", async () => {
      const mockResponse = {
        success: true,
        message: "Verification successful",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyEmailOTP("123456");

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-email/verify",
        { otp: "123456" }
      );
      expect(result.success).toBe(true);
    });

    it("should handle invalid OTP", async () => {
      const mockResponse = {
        success: false,
        message: "Invalid OTP",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyEmailOTP("000000");

      expect(result.success).toBe(false);
    });
  });

  describe("sendPhoneOTP", () => {
    it("should send phone OTP", async () => {
      const mockResponse = {
        success: true,
        message: "OTP sent successfully",
        otpId: "otp_456",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.sendPhoneOTP();

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-phone/send",
        {}
      );
      expect(result.success).toBe(true);
    });
  });

  describe("verifyPhoneOTP", () => {
    it("should verify phone OTP", async () => {
      const mockResponse = {
        success: true,
        message: "Verification successful",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyPhoneOTP("654321");

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-phone/verify",
        { otp: "654321" }
      );
      expect(result.success).toBe(true);
    });
  });

  describe("isEmailVerified", () => {
    it("should check email verification status", async () => {
      const mockResponse = {
        verified: true,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.isEmailVerified();

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/auth/verify-email/status"
      );
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await otpService.isEmailVerified();

      expect(result).toBe(false);
    });
  });

  describe("isPhoneVerified", () => {
    it("should check phone verification status", async () => {
      const mockResponse = {
        verified: true,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.isPhoneVerified();

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/auth/verify-phone/status"
      );
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await otpService.isPhoneVerified();

      expect(result).toBe(false);
    });
  });

  describe("sendOTP (generic)", () => {
    it("should route to sendEmailOTP for email type", async () => {
      const mockResponse = {
        success: true,
        otpId: "otp_email",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.sendOTP({
        userId: "user_123",
        type: "email",
        destination: "test@example.com",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-email/send",
        {}
      );
    });

    it("should route to sendPhoneOTP for phone type", async () => {
      const mockResponse = {
        success: true,
        otpId: "otp_phone",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.sendOTP({
        userId: "user_123",
        type: "phone",
        destination: "+919876543210",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-phone/send",
        {}
      );
    });
  });

  describe("verifyOTP (generic)", () => {
    it("should route to verifyEmailOTP for email type", async () => {
      const mockResponse = {
        success: true,
        message: "Verified",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyOTP({
        userId: "user_123",
        type: "email",
        destination: "test@example.com",
        otp: "123456",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-email/verify",
        { otp: "123456" }
      );
      expect(result.success).toBe(true);
    });

    it("should route to verifyPhoneOTP for phone type", async () => {
      const mockResponse = {
        success: true,
        message: "Verified",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.verifyOTP({
        userId: "user_123",
        type: "phone",
        destination: "+919876543210",
        otp: "654321",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/auth/verify-phone/verify",
        { otp: "654321" }
      );
      expect(result.success).toBe(true);
    });
  });

  describe("isVerified (generic)", () => {
    it("should route to isEmailVerified for email type", async () => {
      const mockResponse = {
        verified: true,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.isVerified("user_123", "email");

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/auth/verify-email/status"
      );
      expect(result).toBe(true);
    });

    it("should route to isPhoneVerified for phone type", async () => {
      const mockResponse = {
        verified: false,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await otpService.isVerified("user_123", "phone");

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/auth/verify-phone/status"
      );
      expect(result).toBe(false);
    });
  });
});
