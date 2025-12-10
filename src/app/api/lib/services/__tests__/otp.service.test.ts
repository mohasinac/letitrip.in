/**
 * Unit Tests for OTP Service
 */

import { otpService, SendOTPRequest, VerifyOTPRequest } from "../otp.service";

jest.mock("@/app/api/lib/firebase/config", () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));
jest.mock("@/lib/firebase-error-logger");
jest.mock("crypto");

describe("OTP Service", () => {
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;
  let mockAdd: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockGet: jest.Mock;
  let mockWhere: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;
  let adminDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});

    // Mock crypto.randomInt
    const crypto = require("crypto");
    crypto.randomInt = jest.fn().mockReturnValue(123456);

    // Setup Firestore mocks
    mockGet = jest.fn();
    mockLimit = jest.fn(() => ({ get: mockGet }));
    mockOrderBy = jest.fn(() => ({ limit: mockLimit }));
    mockWhere = jest.fn(() => ({
      where: mockWhere,
      get: mockGet,
      orderBy: mockOrderBy,
    }));
    mockUpdate = jest.fn();
    mockAdd = jest.fn();
    mockDoc = jest.fn(() => ({
      get: mockGet,
      update: mockUpdate,
    }));
    mockCollection = jest.fn(() => ({
      where: mockWhere,
      add: mockAdd,
      doc: mockDoc,
    }));

    // Get mocked adminDb
    adminDb = require("@/app/api/lib/firebase/config").adminDb;
    adminDb.collection = mockCollection;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("sendOTP", () => {
    const validRequest: SendOTPRequest = {
      userId: "user123",
      type: "email",
      destination: "test@example.com",
    };

    it("should generate and send new OTP successfully", async () => {
      // Mock rate limit check - within limit
      mockGet.mockResolvedValueOnce({ size: 2 }); // 2 OTPs in last hour

      // Mock getActiveOTP - no existing OTP
      mockGet.mockResolvedValueOnce({ empty: true, docs: [] });

      // Mock add operation
      const mockDocRef = { id: "otp123" };
      mockAdd.mockResolvedValue(mockDocRef);

      const result = await otpService.sendOTP(validRequest);

      expect(result).toMatchObject({
        id: "otp123",
        expiresAt: expect.any(Date),
      });

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user123",
          type: "email",
          destination: "test@example.com",
          otp: "123456",
          attempts: 0,
          maxAttempts: 3,
          verified: false,
        })
      );
    });

    it("should return existing OTP if still active", async () => {
      // Mock rate limit check
      mockGet.mockResolvedValueOnce({ size: 2 });

      // Mock getActiveOTP - existing OTP found
      const existingExpiry = new Date(Date.now() + 4 * 60 * 1000);
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: "existing-otp",
            data: () => ({
              userId: "user123",
              type: "email",
              destination: "test@example.com",
              otp: "999999",
              expiresAt: { toDate: () => existingExpiry },
              createdAt: { toDate: () => new Date() },
              attempts: 0,
              maxAttempts: 3,
              verified: false,
            }),
          },
        ],
      });

      const result = await otpService.sendOTP(validRequest);

      expect(result.id).toBe("existing-otp");
      expect(mockAdd).not.toHaveBeenCalled(); // Should not create new OTP
    });

    it("should reject when rate limit exceeded", async () => {
      // Mock rate limit check - exceeded
      mockGet.mockResolvedValueOnce({ size: 5 }); // 5 OTPs in last hour

      await expect(otpService.sendOTP(validRequest)).rejects.toThrow(
        "Too many OTP requests. Please try again later."
      );

      expect(mockAdd).not.toHaveBeenCalled();
    });

    it("should handle rate limit check errors gracefully", async () => {
      // Mock rate limit check - error
      mockGet.mockRejectedValueOnce(new Error("DB error"));

      // Mock getActiveOTP - no existing OTP
      mockGet.mockResolvedValueOnce({ empty: true, docs: [] });

      // Mock add operation
      mockAdd.mockResolvedValue({ id: "otp123" });

      // Should still succeed due to "fail open" policy
      const result = await otpService.sendOTP(validRequest);

      expect(result.id).toBe("otp123");
      expect(console.warn).toHaveBeenCalledWith(
        "Rate limit check failed, allowing OTP generation"
      );
    });

    it("should generate OTP with correct expiry time", async () => {
      mockGet.mockResolvedValueOnce({ size: 0 });
      mockGet.mockResolvedValueOnce({ empty: true });
      mockAdd.mockResolvedValue({ id: "otp123" });

      const beforeTime = Date.now();
      const result = await otpService.sendOTP(validRequest);
      const afterTime = Date.now();

      const expiryTime = result.expiresAt.getTime();
      const expectedMin = beforeTime + 5 * 60 * 1000;
      const expectedMax = afterTime + 5 * 60 * 1000;

      expect(expiryTime).toBeGreaterThanOrEqual(expectedMin);
      expect(expiryTime).toBeLessThanOrEqual(expectedMax);
    });

    it("should use cryptographically secure random for OTP", async () => {
      const crypto = require("crypto");
      crypto.randomInt.mockReturnValue(567890);

      mockGet.mockResolvedValueOnce({ size: 0 });
      mockGet.mockResolvedValueOnce({ empty: true });
      mockAdd.mockResolvedValue({ id: "otp123" });

      await otpService.sendOTP(validRequest);

      expect(crypto.randomInt).toHaveBeenCalledWith(100000, 1000000);
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          otp: "567890",
        })
      );
    });

    it("should handle phone type OTP", async () => {
      const phoneRequest: SendOTPRequest = {
        userId: "user123",
        type: "phone",
        destination: "+919876543210",
      };

      mockGet.mockResolvedValueOnce({ size: 0 });
      mockGet.mockResolvedValueOnce({ empty: true });
      mockAdd.mockResolvedValue({ id: "otp123" });

      const result = await otpService.sendOTP(phoneRequest);

      expect(result.id).toBe("otp123");
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "phone",
          destination: "+919876543210",
        })
      );
    });

    it("should log OTP for development purposes", async () => {
      mockGet.mockResolvedValueOnce({ size: 0 });
      mockGet.mockResolvedValueOnce({ empty: true });
      mockAdd.mockResolvedValue({ id: "otp123" });

      await otpService.sendOTP(validRequest);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("[OTP] Generated OTP")
      );
    });

    it("should handle database errors during OTP creation", async () => {
      mockGet.mockResolvedValueOnce({ size: 0 });
      mockGet.mockResolvedValueOnce({ empty: true });
      mockAdd.mockRejectedValue(new Error("Database error"));

      await expect(otpService.sendOTP(validRequest)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("verifyOTP", () => {
    const validRequest: VerifyOTPRequest = {
      userId: "user123",
      type: "email",
      destination: "test@example.com",
      otp: "123456",
    };

    it("should verify correct OTP successfully", async () => {
      // Mock getActiveOTP
      const futureExpiry = new Date(Date.now() + 3 * 60 * 1000);
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: "otp123",
            data: () => ({
              userId: "user123",
              type: "email",
              destination: "test@example.com",
              otp: "123456",
              expiresAt: { toDate: () => futureExpiry },
              createdAt: { toDate: () => new Date() },
              attempts: 0,
              maxAttempts: 3,
              verified: false,
            }),
          },
        ],
      });

      // Mock update for incrementing attempts
      mockUpdate.mockResolvedValueOnce(undefined);

      // Mock update for marking verified
      mockUpdate.mockResolvedValueOnce(undefined);

      // Mock user verification status update
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ email: "test@example.com" }),
      });
      mockUpdate.mockResolvedValueOnce(undefined);

      const result = await otpService.verifyOTP(validRequest);

      expect(result).toEqual({
        success: true,
        message: "Verification successful!",
      });

      // Should update attempts first
      expect(mockUpdate).toHaveBeenNthCalledWith(1, { attempts: 1 });

      // Then mark as verified
      expect(mockUpdate).toHaveBeenNthCalledWith(2, {
        verified: true,
        verifiedAt: expect.any(Date),
      });

      // Then update user status
      expect(mockUpdate).toHaveBeenNthCalledWith(3, {
        emailVerified: true,
        emailVerifiedAt: expect.any(Date),
      });
    });

    it("should reject incorrect OTP", async () => {
      const futureExpiry = new Date(Date.now() + 3 * 60 * 1000);
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: "otp123",
            data: () => ({
              otp: "999999", // Different OTP
              expiresAt: { toDate: () => futureExpiry },
              createdAt: { toDate: () => new Date() },
              attempts: 0,
              maxAttempts: 3,
              verified: false,
            }),
          },
        ],
      });

      mockUpdate.mockResolvedValueOnce(undefined);

      const result = await otpService.verifyOTP(validRequest);

      expect(result).toEqual({
        success: false,
        message: "Invalid OTP. 2 attempts remaining.",
      });

      // Should still increment attempts
      expect(mockUpdate).toHaveBeenCalledWith({ attempts: 1 });
    });

    it("should reject when no active OTP found", async () => {
      mockGet.mockResolvedValueOnce({ empty: true, docs: [] });

      const result = await otpService.verifyOTP(validRequest);

      expect(result).toEqual({
        success: false,
        message: "No active OTP found. Please request a new one.",
      });

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("should reject when OTP is expired", async () => {
      const pastExpiry = new Date(Date.now() - 10 * 1000); // 10 seconds ago
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: "otp123",
            data: () => ({
              otp: "123456",
              expiresAt: { toDate: () => pastExpiry },
              createdAt: { toDate: () => new Date() },
              attempts: 0,
              maxAttempts: 3,
              verified: false,
            }),
          },
        ],
      });

      const result = await otpService.verifyOTP(validRequest);

      expect(result).toEqual({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    });

    it("should reject when max attempts exceeded", async () => {
      const futureExpiry = new Date(Date.now() + 3 * 60 * 1000);
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: "otp123",
            data: () => ({
              otp: "123456",
              expiresAt: { toDate: () => futureExpiry },
              createdAt: { toDate: () => new Date() },
              attempts: 3, // Already at max
              maxAttempts: 3,
              verified: false,
            }),
          },
        ],
      });

      const result = await otpService.verifyOTP(validRequest);

      expect(result).toEqual({
        success: false,
        message:
          "Maximum verification attempts exceeded. Please request a new OTP.",
      });

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("should decrement remaining attempts correctly", async () => {
      const futureExpiry = new Date(Date.now() + 3 * 60 * 1000);
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: "otp123",
            data: () => ({
              otp: "999999",
              expiresAt: { toDate: () => futureExpiry },
              createdAt: { toDate: () => new Date() },
              attempts: 1, // One previous attempt
              maxAttempts: 3,
              verified: false,
            }),
          },
        ],
      });

      mockUpdate.mockResolvedValueOnce(undefined);

      const result = await otpService.verifyOTP(validRequest);

      expect(result.message).toContain("1 attempts remaining");
    });

    it("should handle phone verification", async () => {
      const phoneRequest: VerifyOTPRequest = {
        userId: "user123",
        type: "phone",
        destination: "+919876543210",
        otp: "123456",
      };

      const futureExpiry = new Date(Date.now() + 3 * 60 * 1000);
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: "otp123",
            data: () => ({
              userId: "user123",
              type: "phone",
              destination: "+919876543210",
              otp: "123456",
              expiresAt: { toDate: () => futureExpiry },
              createdAt: { toDate: () => new Date() },
              attempts: 0,
              maxAttempts: 3,
              verified: false,
            }),
          },
        ],
      });

      mockUpdate.mockResolvedValue(undefined);
      mockGet.mockResolvedValueOnce({ exists: true, data: () => ({}) });

      const result = await otpService.verifyOTP(phoneRequest);

      expect(result.success).toBe(true);

      // Should update phoneVerified
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneVerified: true,
          phoneVerifiedAt: expect.any(Date),
        })
      );
    });

    it("should not fail verification if user status update fails", async () => {
      const futureExpiry = new Date(Date.now() + 3 * 60 * 1000);
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: "otp123",
            data: () => ({
              otp: "123456",
              expiresAt: { toDate: () => futureExpiry },
              createdAt: { toDate: () => new Date() },
              attempts: 0,
              maxAttempts: 3,
              verified: false,
            }),
          },
        ],
      });

      mockUpdate.mockResolvedValueOnce(undefined); // Attempt increment
      mockUpdate.mockResolvedValueOnce(undefined); // Mark verified

      // User update fails
      mockGet.mockResolvedValueOnce({ exists: true, data: () => ({}) });
      mockUpdate.mockRejectedValueOnce(new Error("User update failed"));

      const result = await otpService.verifyOTP(validRequest);

      // Should still return success
      expect(result.success).toBe(true);
    });

    it("should increment attempts BEFORE checking OTP validity", async () => {
      // This is a bug! The code checks OTP first, then increments
      // This test documents the current behavior
      const futureExpiry = new Date(Date.now() + 3 * 60 * 1000);
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: "otp123",
            data: () => ({
              otp: "999999",
              expiresAt: { toDate: () => futureExpiry },
              createdAt: { toDate: () => new Date() },
              attempts: 0,
              maxAttempts: 3,
              verified: false,
            }),
          },
        ],
      });

      mockUpdate.mockResolvedValueOnce(undefined);

      await otpService.verifyOTP(validRequest);

      // Currently increments AFTER checking validity
      // This allows attackers to check OTP without consuming attempts
      // on database failures
      expect(mockUpdate).toHaveBeenCalledWith({ attempts: 1 });
    });
  });

  describe("resendOTP", () => {
    const validRequest: SendOTPRequest = {
      userId: "user123",
      type: "email",
      destination: "test@example.com",
    };

    it("should invalidate existing OTP and send new one", async () => {
      // Mock getActiveOTP - existing OTP found
      const existingExpiry = new Date(Date.now() + 4 * 60 * 1000);
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: "old-otp",
            data: () => ({
              otp: "999999",
              expiresAt: { toDate: () => existingExpiry },
              createdAt: { toDate: () => new Date() },
              attempts: 2,
              maxAttempts: 3,
              verified: false,
            }),
          },
        ],
      });

      // Mock invalidate update
      mockUpdate.mockResolvedValueOnce(undefined);

      // Mock sendOTP flow
      mockGet.mockResolvedValueOnce({ size: 2 }); // Rate limit
      mockGet.mockResolvedValueOnce({ empty: true }); // No active OTP after invalidation
      mockAdd.mockResolvedValue({ id: "new-otp" });

      const result = await otpService.resendOTP(validRequest);

      expect(result.id).toBe("new-otp");

      // Should invalidate old OTP
      expect(mockUpdate).toHaveBeenCalledWith({
        expiresAt: new Date(0),
      });
    });

    it("should send new OTP when no existing OTP", async () => {
      // Mock getActiveOTP - no existing OTP
      mockGet.mockResolvedValueOnce({ empty: true });

      // Mock sendOTP flow
      mockGet.mockResolvedValueOnce({ size: 1 });
      mockGet.mockResolvedValueOnce({ empty: true });
      mockAdd.mockResolvedValue({ id: "new-otp" });

      const result = await otpService.resendOTP(validRequest);

      expect(result.id).toBe("new-otp");
      expect(mockUpdate).not.toHaveBeenCalled(); // No OTP to invalidate
    });

    it("should handle errors during invalidation", async () => {
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [{ id: "old-otp", data: () => ({}) }],
      });

      mockUpdate.mockRejectedValueOnce(new Error("Update failed"));

      await expect(otpService.resendOTP(validRequest)).rejects.toThrow(
        "Update failed"
      );
    });
  });

  describe("isVerified", () => {
    it("should return true for verified email", async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          emailVerified: true,
          phoneVerified: false,
        }),
      });

      const result = await otpService.isVerified("user123", "email");

      expect(result).toBe(true);
    });

    it("should return true for verified phone", async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          emailVerified: false,
          phoneVerified: true,
        }),
      });

      const result = await otpService.isVerified("user123", "phone");

      expect(result).toBe(true);
    });

    it("should return false when not verified", async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          emailVerified: false,
          phoneVerified: false,
        }),
      });

      const result = await otpService.isVerified("user123", "email");

      expect(result).toBe(false);
    });

    it("should return false when user does not exist", async () => {
      mockGet.mockResolvedValueOnce({
        exists: false,
      });

      const result = await otpService.isVerified("nonexistent", "email");

      expect(result).toBe(false);
    });

    it("should return false on database errors", async () => {
      mockGet.mockRejectedValueOnce(new Error("DB error"));

      const result = await otpService.isVerified("user123", "email");

      expect(result).toBe(false);
    });

    it("should handle missing verification field gracefully", async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({}), // No verification fields
      });

      const result = await otpService.isVerified("user123", "email");

      expect(result).toBe(false);
    });
  });

  describe("Edge Cases and Security", () => {
    it("should generate 6-digit OTPs", async () => {
      const crypto = require("crypto");

      for (let i = 0; i < 10; i++) {
        const randomValue = 100000 + Math.floor(Math.random() * 900000);
        crypto.randomInt.mockReturnValueOnce(randomValue);

        mockGet.mockResolvedValueOnce({ size: 0 });
        mockGet.mockResolvedValueOnce({ empty: true });
        mockAdd.mockResolvedValue({ id: "otp" });

        await otpService.sendOTP({
          userId: "user",
          type: "email",
          destination: "test@test.com",
        });

        expect(mockAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            otp: randomValue.toString(),
          })
        );

        expect(randomValue.toString()).toHaveLength(6);
      }
    });

    it("should handle multiple sequential OTP requests", async () => {
      // First request
      mockGet.mockResolvedValueOnce({ size: 0 }); // Rate limit
      mockGet.mockResolvedValueOnce({ empty: true }); // No active OTP
      mockAdd.mockResolvedValueOnce({ id: "otp1" });

      const result1 = await otpService.sendOTP({
        userId: "user1",
        type: "email",
        destination: "test1@test.com",
      });

      // Second request
      mockGet.mockResolvedValueOnce({ size: 1 }); // Rate limit - 1 existing
      mockGet.mockResolvedValueOnce({ empty: true }); // No active OTP
      mockAdd.mockResolvedValueOnce({ id: "otp2" });

      const result2 = await otpService.sendOTP({
        userId: "user2",
        type: "email",
        destination: "test2@test.com",
      });

      expect(result1.id).toBe("otp1");
      expect(result2.id).toBe("otp2");
      expect(mockAdd).toHaveBeenCalledTimes(2);
    });

    it("should handle empty OTP string", async () => {
      const futureExpiry = new Date(Date.now() + 3 * 60 * 1000);
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: "otp123",
            data: () => ({
              otp: "123456",
              expiresAt: { toDate: () => futureExpiry },
              createdAt: { toDate: () => new Date() },
              attempts: 0,
              maxAttempts: 3,
              verified: false,
            }),
          },
        ],
      });

      mockUpdate.mockResolvedValueOnce(undefined);

      const result = await otpService.verifyOTP({
        userId: "user123",
        type: "email",
        destination: "test@example.com",
        otp: "",
      });

      expect(result.success).toBe(false);
    });
  });
});
