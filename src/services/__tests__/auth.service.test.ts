import { apiService } from "../api.service";
import { authService } from "../auth.service";

// Mock the api service
jest.mock("../api.service");

// Mock error logger
jest.mock("@/lib/error-logger", () => ({
  logServiceError: jest.fn(),
}));

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
    // Clear cookies
    document.cookie = "";
  });

  describe("register", () => {
    it("registers a new user successfully", async () => {
      const mockResponse = {
        message: "Registration successful",
        user: {
          uid: "test-uid",
          email: "test@example.com",
          name: "Test User",
          role: "user",
          isEmailVerified: false,
        },
        sessionId: "test-session",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.register({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(result).toBeDefined();
      expect(result.user.email).toBe("test@example.com");
      expect(result.sessionId).toBe("test-session");
      expect(apiService.post).toHaveBeenCalledWith("/auth/register", {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });

    it("handles registration errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Email already exists")
      );

      await expect(
        authService.register({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        })
      ).rejects.toThrow("Email already exists");
    });

    it("registers with custom role", async () => {
      const mockResponse = {
        message: "Registration successful",
        user: {
          uid: "test-uid",
          email: "seller@example.com",
          name: "Seller User",
          role: "seller",
          isEmailVerified: false,
        },
        sessionId: "test-session",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await authService.register({
        email: "seller@example.com",
        password: "password123",
        name: "Seller User",
        role: "seller",
      });

      expect(apiService.post).toHaveBeenCalledWith("/auth/register", {
        email: "seller@example.com",
        password: "password123",
        name: "Seller User",
        role: "seller",
      });
    });
  });

  describe("login", () => {
    it("logs in user successfully", async () => {
      const mockResponse = {
        message: "Login successful",
        user: {
          uid: "test-uid",
          email: "test@example.com",
          name: "Test User",
          role: "user",
          isEmailVerified: true,
        },
        sessionId: "test-session",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toBeDefined();
      expect(result.user.email).toBe("test@example.com");
      expect(result.sessionId).toBe("test-session");
      expect(apiService.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
    });

    it("handles login errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Invalid credentials")
      );

      await expect(
        authService.login({
          email: "test@example.com",
          password: "wrongpassword",
        })
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("logout", () => {
    it("logs out user successfully", async () => {
      const mockResponse = { message: "Logout successful" };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await authService.logout();

      expect(apiService.post).toHaveBeenCalledWith("/auth/logout", {});
    });

    it("handles logout errors gracefully", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Logout failed")
      );

      // Should not throw - errors are handled internally
      await expect(authService.logout()).resolves.not.toThrow();
    });
  });

  describe("getCurrentUser", () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    it("gets current user successfully and stores in localStorage", async () => {
      const mockUserBE: any = {
        uid: "test-uid",
        email: "test@example.com",
        name: "Test User",
        role: "user" as const,
        isEmailVerified: true,
        profile: {
          avatar: "https://example.com/photo.jpg",
          bio: "Test bio",
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        user: mockUserBE,
        session: {},
      });

      const result = await authService.getCurrentUser();

      expect(result).toBeDefined();
      expect(result?.uid).toBe("test-uid");
      expect(result?.email).toBe("test@example.com");
      expect(result?.displayName).toBe("Test User");
      expect(result?.fullName).toBe("Test User");
      expect(apiService.get).toHaveBeenCalledWith("/auth/me");

      // Verify user was stored in localStorage
      const stored = localStorage.getItem("user");
      expect(stored).toBeTruthy();
      const parsedUser = JSON.parse(stored!);
      expect(parsedUser.uid).toBe("test-uid");
    });
    it("returns null when user is not authenticated", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Not authenticated")
      );

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });

    it("clears localStorage on 401 error", async () => {
      // Store a user first
      localStorage.setItem("user", JSON.stringify({ uid: "old-user" }));

      const error: any = new Error("Unauthorized");
      error.response = { status: 401 };
      (apiService.get as jest.Mock).mockRejectedValue(error);

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });

    it("keeps localStorage on non-401 errors", async () => {
      // Store a user first
      localStorage.setItem("user", JSON.stringify({ uid: "existing-user" }));

      const error: any = new Error("Network error");
      error.response = { status: 500 };
      (apiService.get as jest.Mock).mockRejectedValue(error);

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
      expect(localStorage.getItem("user")).toBeTruthy();
    });
  });

  describe("verifyEmail", () => {
    it("verifies email successfully", async () => {
      const mockResponse = { message: "Email verified successfully" };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.verifyEmail("valid-token-123");

      expect(result).toEqual(mockResponse);
      expect(result.message).toBe("Email verified successfully");
      expect(apiService.post).toHaveBeenCalledWith("/auth/verify-email", {
        token: "valid-token-123",
      });
    });

    it("handles verify email errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Invalid or expired token")
      );

      await expect(authService.verifyEmail("invalid-token")).rejects.toThrow(
        "Invalid or expired token"
      );
    });
  });

  describe("requestPasswordReset", () => {
    it("sends password reset email successfully", async () => {
      const mockResponse = { message: "Password reset email sent" };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.requestPasswordReset("test@example.com");

      expect(result).toEqual(mockResponse);
      expect(result.message).toBe("Password reset email sent");
      expect(apiService.post).toHaveBeenCalledWith("/auth/reset-password", {
        email: "test@example.com",
      });
    });

    it("handles password reset errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Email not found")
      );

      await expect(
        authService.requestPasswordReset("notfound@example.com")
      ).rejects.toThrow("Email not found");
    });
  });

  describe("updateProfile", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("updates user profile successfully and stores in localStorage", async () => {
      const mockUserBE: any = {
        uid: "test-uid",
        email: "test@example.com",
        name: "Updated User",
        role: "user" as const,
        isEmailVerified: true,
        profile: {
          avatar: "https://example.com/updated-photo.jpg",
          bio: "Updated bio",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue({ user: mockUserBE });

      const result = await authService.updateProfile({
        displayName: "Updated User",
      });

      expect(result).toBeDefined();
      expect(result.uid).toBe("test-uid");
      expect(result.displayName).toBe("Updated User");
      expect(result.fullName).toBe("Updated User");
      expect(apiService.patch).toHaveBeenCalledWith("/auth/profile", {
        displayName: "Updated User",
      });

      // Verify updated user was stored in localStorage
      const stored = localStorage.getItem("user");
      expect(stored).toBeTruthy();
      const parsedUser = JSON.parse(stored!);
      expect(parsedUser.displayName).toBe("Updated User");
    });
    it("handles update profile errors", async () => {
      (apiService.patch as jest.Mock).mockRejectedValue(
        new Error("Validation failed")
      );

      await expect(authService.updateProfile({ name: "" })).rejects.toThrow(
        "Validation failed"
      );

      // Verify localStorage wasn't modified
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  describe("changePassword", () => {
    it("changes password successfully", async () => {
      const mockResponse = { message: "Password changed successfully" };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.changePassword(
        "oldpassword",
        "newpassword123"
      );

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith("/auth/change-password", {
        currentPassword: "oldpassword",
        newPassword: "newpassword123",
      });
    });

    it("handles change password errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Current password is incorrect")
      );

      await expect(
        authService.changePassword("wrongpassword", "newpassword123")
      ).rejects.toThrow("Current password is incorrect");
    });
  });
});
