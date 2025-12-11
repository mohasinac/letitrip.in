import { VALIDATION_MESSAGES } from "@/constants/validation-messages";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { adminAuth, adminDb } from "../../../lib/firebase/config";
import {
  clearSessionCookie,
  createSession,
  setSessionCookie,
} from "../../../lib/session";
import { POST } from "../route";

// Mock dependencies
jest.mock("../../../lib/firebase/config", () => ({
  adminAuth: {
    createUser: jest.fn(),
    generateEmailVerificationLink: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(),
  },
}));

jest.mock("bcryptjs");
jest.mock("../../../lib/session");
jest.mock("@/app/api/middleware/ip-tracker", () => ({
  withRegistrationTracking: (handler: any) => handler,
}));

// Mock email service
jest.mock("@/app/api/lib/email/email.service", () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
  },
}));

describe("POST /api/auth/register", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for bcrypt
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");

    // Default mock for session creation
    (createSession as jest.Mock).mockResolvedValue({
      sessionId: "session-123",
      token: "token-abc",
    });
  });

  describe("Successful Registration", () => {
    const mockUserData = {
      email: "test@example.com",
      password: "Password123!",
      name: "Test User",
    };

    const mockUserRecord = {
      uid: "user-123",
      email: "test@example.com",
      displayName: "Test User",
      phoneNumber: null,
    };

    beforeEach(() => {
      mockRequest = {
        json: jest.fn().mockResolvedValue(mockUserData),
      } as any;

      // Mock Firestore - user doesn't exist
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockSet = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ set: mockSet }));
      const mockCollection = jest.fn(() => ({
        where: mockWhere,
        doc: mockDoc,
      }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      // Mock auth
      (adminAuth.createUser as jest.Mock).mockResolvedValue(mockUserRecord);
      (adminAuth.generateEmailVerificationLink as jest.Mock).mockResolvedValue(
        "https://verify.link"
      );
    });

    it("should register user with valid credentials", async () => {
      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe("User registered successfully");
      expect(data.user).toEqual({
        uid: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        isEmailVerified: false,
      });
      expect(data.sessionId).toBe("session-123");
      expect(setSessionCookie).toHaveBeenCalledWith(response, "token-abc");
    });

    it("should lowercase email before registration", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          ...mockUserData,
          email: "TEST@EXAMPLE.COM",
        }),
      } as any;

      await POST(mockRequest);

      expect(adminAuth.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
        })
      );
    });

    it("should hash password before storing", async () => {
      await POST(mockRequest);

      expect(bcrypt.hash).toHaveBeenCalledWith("Password123!", 12);

      // Check Firestore user data includes hashed password
      const setCall = (
        adminDb.collection as jest.Mock
      ).mock.results[1].value.doc().set;
      expect(setCall).toHaveBeenCalledWith(
        expect.objectContaining({
          hashedPassword: "hashedPassword123",
        })
      );
    });

    it("should default role to 'user' when not provided", async () => {
      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.user.role).toBe("user");
    });

    it("should accept valid seller role", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          ...mockUserData,
          role: "seller",
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.user.role).toBe("seller");
    });

    it("should accept valid admin role", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          ...mockUserData,
          role: "admin",
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.user.role).toBe("admin");
    });

    it("should default to 'user' for invalid role", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          ...mockUserData,
          role: "superadmin", // invalid role
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.user.role).toBe("user");
    });

    it("should create session immediately after registration", async () => {
      await POST(mockRequest);

      expect(createSession).toHaveBeenCalledWith(
        "user-123",
        "test@example.com",
        "user",
        mockRequest
      );
    });

    it("should send verification email", async () => {
      await POST(mockRequest);

      expect(adminAuth.generateEmailVerificationLink).toHaveBeenCalledWith(
        "test@example.com"
      );
    });

    it("should continue registration if email sending fails", async () => {
      (adminAuth.generateEmailVerificationLink as jest.Mock).mockRejectedValue(
        new Error("Email service down")
      );

      const response = await POST(mockRequest);

      expect(response.status).toBe(201);
    });

    it("should include phoneNumber if provided", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          ...mockUserData,
          phoneNumber: "+911234567890",
        }),
      } as any;

      await POST(mockRequest);

      expect(adminAuth.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber: "+911234567890",
        })
      );
    });
  });

  describe("Validation Errors", () => {
    beforeEach(() => {
      // Setup basic mocks for validation tests
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockCollection = jest.fn(() => ({ where: mockWhere }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);
    });

    it("should reject request without email", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          password: "Password123!",
          name: "Test User",
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing required fields");
      expect(data.fields).toEqual(["email", "password", "name"]);
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should reject request without password", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          name: "Test User",
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing required fields");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should reject request without name", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "Password123!",
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing required fields");
      expect(data.fields).toEqual(["email", "password", "name"]);
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should reject invalid email format", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "invalid-email",
          password: "Password123!",
          name: "Test User",
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(VALIDATION_MESSAGES.EMAIL.INVALID);
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should reject password shorter than minimum length", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "short",
          name: "Test User",
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(VALIDATION_MESSAGES.PASSWORD.TOO_SHORT);
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should reject empty email", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "",
          password: "Password123!",
          name: "Test User",
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing required fields");
    });

    it("should reject empty name", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "Password123!",
          name: "",
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing required fields");
    });
  });

  describe("Duplicate User Errors", () => {
    const mockUserData = {
      email: "existing@example.com",
      password: "Password123!",
      name: "Test User",
    };

    it("should reject registration if user already exists in Firestore", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue(mockUserData),
      } as any;

      // Mock Firestore - user exists
      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ data: () => ({ email: "existing@example.com" }) }],
      });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockCollection = jest.fn(() => ({ where: mockWhere }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("User already exists");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
      expect(adminAuth.createUser).not.toHaveBeenCalled();
    });

    it("should handle Firebase auth/email-already-exists error", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue(mockUserData),
      } as any;

      // Mock Firestore - user doesn't exist (Firestore check passes)
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockCollection = jest.fn(() => ({ where: mockWhere }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      // But Firebase Auth rejects with email-already-exists
      const authError: any = new Error("Email already exists");
      authError.code = "auth/email-already-exists";
      (adminAuth.createUser as jest.Mock).mockRejectedValue(authError);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("Email already exists");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });
  });

  describe("Firebase Auth Errors", () => {
    const mockUserData = {
      email: "test@example.com",
      password: "Password123!",
      name: "Test User",
    };

    beforeEach(() => {
      mockRequest = {
        json: jest.fn().mockResolvedValue(mockUserData),
      } as any;

      // Mock Firestore - user doesn't exist
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockCollection = jest.fn(() => ({ where: mockWhere }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);
    });

    it("should handle auth/invalid-email error", async () => {
      const authError: any = new Error("Invalid email");
      authError.code = "auth/invalid-email";
      (adminAuth.createUser as jest.Mock).mockRejectedValue(authError);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid email address");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should handle auth/invalid-password error", async () => {
      const authError: any = new Error("Invalid password");
      authError.code = "auth/invalid-password";
      (adminAuth.createUser as jest.Mock).mockRejectedValue(authError);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Invalid password. Password must be at least 6 characters"
      );
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });
  });

  describe("Error Handling", () => {
    const mockUserData = {
      email: "test@example.com",
      password: "Password123!",
      name: "Test User",
    };

    beforeEach(() => {
      mockRequest = {
        json: jest.fn().mockResolvedValue(mockUserData),
      } as any;
    });

    it("should handle database query errors", async () => {
      const mockGet = jest.fn().mockRejectedValue(new Error("Database error"));
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockCollection = jest.fn(() => ({ where: mockWhere }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Registration failed");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should handle bcrypt hashing errors", async () => {
      // Setup Firestore to pass
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockCollection = jest.fn(() => ({ where: mockWhere }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error("Hash error"));

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Registration failed");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should handle Firestore write errors", async () => {
      // Setup Firestore check to pass
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockSet = jest.fn().mockRejectedValue(new Error("Write error"));
      const mockDoc = jest.fn(() => ({ set: mockSet }));
      const mockCollection = jest.fn(() => ({
        where: mockWhere,
        doc: mockDoc,
      }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      (adminAuth.createUser as jest.Mock).mockResolvedValue({
        uid: "user-123",
        email: "test@example.com",
      });

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Registration failed");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should handle session creation errors", async () => {
      // Setup all dependencies to succeed
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockSet = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ set: mockSet }));
      const mockCollection = jest.fn(() => ({
        where: mockWhere,
        doc: mockDoc,
      }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      (adminAuth.createUser as jest.Mock).mockResolvedValue({
        uid: "user-123",
        email: "test@example.com",
      });
      (adminAuth.generateEmailVerificationLink as jest.Mock).mockResolvedValue(
        "https://verify.link"
      );

      // Session creation fails
      (createSession as jest.Mock).mockRejectedValue(
        new Error("Session error")
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Registration failed");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should handle malformed JSON", async () => {
      mockRequest = {
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Registration failed");
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should not expose detailed error messages in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const mockGet = jest
        .fn()
        .mockRejectedValue(new Error("Sensitive database error"));
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockCollection = jest.fn(() => ({ where: mockWhere }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.message).toBe("An unexpected error occurred");
      expect(data.message).not.toContain("Sensitive");

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      // Setup default mocks for edge case tests
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockSet = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ set: mockSet }));
      const mockCollection = jest.fn(() => ({
        where: mockWhere,
        doc: mockDoc,
      }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      (adminAuth.createUser as jest.Mock).mockResolvedValue({
        uid: "user-123",
        email: "test@example.com",
        displayName: "Test User",
      });
      (adminAuth.generateEmailVerificationLink as jest.Mock).mockResolvedValue(
        "https://verify.link"
      );
    });

    it("should handle very long email", async () => {
      const longEmail = "a".repeat(250) + "@example.com";
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: longEmail,
          password: "Password123!",
          name: "Test User",
        }),
      } as any;

      const response = await POST(mockRequest);

      // Should be handled by Firebase auth validation
      expect([201, 400, 500]).toContain(response.status);
    });

    it("should handle very long name", async () => {
      const longName = "A".repeat(500);
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "Password123!",
          name: longName,
        }),
      } as any;

      const response = await POST(mockRequest);

      // Should succeed or fail gracefully
      expect([201, 400, 500]).toContain(response.status);
    });

    it("should handle unicode characters in name", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "Password123!",
          name: "测试用户 🚀",
        }),
      } as any;

      const response = await POST(mockRequest);

      expect(response.status).toBe(201);
    });

    it("should handle unicode characters in password", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "Password123!密码🔒",
          name: "Test User",
        }),
      } as any;

      const response = await POST(mockRequest);

      expect(response.status).toBe(201);
    });

    it("should handle null phoneNumber", async () => {
      mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "Password123!",
          name: "Test User",
          phoneNumber: null,
        }),
      } as any;

      const response = await POST(mockRequest);

      expect(response.status).toBe(201);
    });
  });

  describe("Security", () => {
    const mockUserData = {
      email: "test@example.com",
      password: "Password123!",
      name: "Test User",
    };

    beforeEach(() => {
      mockRequest = {
        json: jest.fn().mockResolvedValue(mockUserData),
      } as any;
    });

    it("should clear session cookie on all error responses", async () => {
      // Test validation error
      mockRequest = {
        json: jest.fn().mockResolvedValue({ email: "test@example.com" }),
      } as any;

      let response = await POST(mockRequest);
      expect(clearSessionCookie).toHaveBeenCalledWith(response);

      jest.clearAllMocks();

      // Test duplicate user error
      const mockGet = jest.fn().mockResolvedValue({ empty: false });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockCollection = jest.fn(() => ({ where: mockWhere }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      mockRequest = {
        json: jest.fn().mockResolvedValue(mockUserData),
      } as any;

      response = await POST(mockRequest);
      expect(clearSessionCookie).toHaveBeenCalledWith(response);
    });

    it("should use bcrypt with salt rounds 12", async () => {
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockSet = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ set: mockSet }));
      const mockCollection = jest.fn(() => ({
        where: mockWhere,
        doc: mockDoc,
      }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      (adminAuth.createUser as jest.Mock).mockResolvedValue({
        uid: "user-123",
        email: "test@example.com",
      });
      (adminAuth.generateEmailVerificationLink as jest.Mock).mockResolvedValue(
        "https://verify.link"
      );

      await POST(mockRequest);

      expect(bcrypt.hash).toHaveBeenCalledWith("Password123!", 12);
    });

    it("should not store plain text password", async () => {
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockSet = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ set: mockSet }));
      const mockCollection = jest.fn(() => ({
        where: mockWhere,
        doc: mockDoc,
      }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      (adminAuth.createUser as jest.Mock).mockResolvedValue({
        uid: "user-123",
        email: "test@example.com",
      });
      (adminAuth.generateEmailVerificationLink as jest.Mock).mockResolvedValue(
        "https://verify.link"
      );

      await POST(mockRequest);

      const setCall = mockSet.mock.calls[0][0];
      expect(setCall.password).toBeUndefined();
      expect(setCall.hashedPassword).toBe("hashedPassword123");
    });

    it("should limit Firestore query to 1 result for performance", async () => {
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockCollection = jest.fn(() => ({ where: mockWhere }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      await POST(mockRequest);

      expect(mockLimit).toHaveBeenCalledWith(1);
    });

    it("should set isEmailVerified to false initially", async () => {
      const mockGet = jest.fn().mockResolvedValue({ empty: true });
      const mockLimit = jest.fn(() => ({ get: mockGet }));
      const mockWhere = jest.fn(() => ({ limit: mockLimit }));
      const mockSet = jest.fn().mockResolvedValue({});
      const mockDoc = jest.fn(() => ({ set: mockSet }));
      const mockCollection = jest.fn(() => ({
        where: mockWhere,
        doc: mockDoc,
      }));
      (adminDb.collection as jest.Mock).mockImplementation(mockCollection);

      (adminAuth.createUser as jest.Mock).mockResolvedValue({
        uid: "user-123",
        email: "test@example.com",
      });
      (adminAuth.generateEmailVerificationLink as jest.Mock).mockResolvedValue(
        "https://verify.link"
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.user.isEmailVerified).toBe(false);

      const setCall = mockSet.mock.calls[0][0];
      expect(setCall.isEmailVerified).toBe(false);
    });
  });
});
