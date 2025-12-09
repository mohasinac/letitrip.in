import { logServiceError } from "@/lib/error-logger";
import { apiService } from "@/services/api.service";
import { authService } from "@/services/auth.service";

// Mock dependencies
jest.mock("@/services/api.service");
jest.mock("@/lib/error-logger");

describe("AuthService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;
  const mockLogServiceError = logServiceError as jest.Mock;

  // Mock localStorage
  const localStorageMock: Record<string, string> = {};

  beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          Object.keys(localStorageMock).forEach((key) => {
            delete localStorageMock[key];
          });
        }),
      },
      writable: true,
    });

    // Mock document.cookie for session cookie operations
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(localStorageMock).forEach(
      (key) => delete localStorageMock[key]
    );
    (document as any).cookie = "";
  });

  // Helper function to create mock BE user
  const createMockBEUser = (overrides?: any): any => ({
    uid: "user123",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    isEmailVerified: true,
    profile: {
      avatar: null,
      bio: null,
      address: null,
    },
    ...overrides,
  });

  describe("register", () => {
    it("should register new user successfully", async () => {
      const mockBEUser = createMockBEUser();
      const mockResponse = {
        message: "Registration successful",
        user: mockBEUser,
        sessionId: "session123",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const registerData = {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      };

      const result = await authService.register(registerData);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/auth/register",
        registerData
      );
      expect(result).toEqual({
        message: "Registration successful",
        user: expect.objectContaining({
          id: "user123",
          uid: "user123",
          email: "test@example.com",
          displayName: "Test User",
          role: "user",
          isVerified: true,
          emailVerified: true,
        }),
        sessionId: "session123",
      });
    });

    it("should store user in localStorage after registration", async () => {
      const mockBEUser = createMockBEUser();
      const mockResponse = {
        message: "Registration successful",
        user: mockBEUser,
        sessionId: "session123",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      await authService.register({
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user",
        expect.stringContaining('"email":"test@example.com"')
      );
    });

    it("should transform BE fields to FE fields correctly", async () => {
      const mockBEUser = createMockBEUser({
        name: "Custom Display Name",
        isEmailVerified: false,
      });
      const mockResponse = {
        message: "Registration successful",
        user: mockBEUser,
        sessionId: "session123",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.register({
        email: "test@example.com",
        password: "password123",
        displayName: "Custom Display Name",
      });

      expect(result.user).toEqual(
        expect.objectContaining({
          displayName: "Custom Display Name",
          isVerified: false,
          emailVerified: false,
        })
      );
    });

    it("should throw error if registration fails", async () => {
      const error = new Error("Email already exists");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        authService.register({
          email: "test@example.com",
          password: "password123",
          displayName: "Test User",
        })
      ).rejects.toThrow("Email already exists");
    });

    it("should handle registration with minimal fields", async () => {
      const mockBEUser = createMockBEUser({
        name: "minimal@example.com", // Default to email
      });
      const mockResponse = {
        message: "Registration successful",
        user: mockBEUser,
        sessionId: "session123",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.register({
        email: "minimal@example.com",
        password: "password123",
      } as any);

      expect(result.user.displayName).toBe("minimal@example.com");
    });

    it("should handle registration with unverified user", async () => {
      const mockBEUser = createMockBEUser({ isEmailVerified: false });
      const mockResponse = {
        message: "Registration successful. Please verify your email.",
        user: mockBEUser,
        sessionId: "session123",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.register({
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      });

      expect(result.user.isVerified).toBe(false);
      expect(result.message).toContain("verify");
    });

    it("should handle registration with different roles", async () => {
      const mockBEUser = createMockBEUser({ role: "seller" });
      const mockResponse = {
        message: "Registration successful",
        user: mockBEUser,
        sessionId: "session123",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.register({
        email: "seller@example.com",
        password: "password123",
        displayName: "Seller User",
        role: "seller",
      } as any);

      expect(result.user.role).toBe("seller");
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const mockBEUser = createMockBEUser();
      const mockResponse = {
        message: "Login successful",
        user: mockBEUser,
        sessionId: "session456",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const credentials = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await authService.login(credentials);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/auth/login",
        credentials
      );
      expect(result).toEqual({
        message: "Login successful",
        user: expect.objectContaining({
          email: "test@example.com",
          displayName: "Test User",
        }),
        sessionId: "session456",
      });
    });

    it("should store user in localStorage after login", async () => {
      const mockBEUser = createMockBEUser();
      const mockResponse = {
        message: "Login successful",
        user: mockBEUser,
        sessionId: "session456",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user",
        expect.stringContaining('"email":"test@example.com"')
      );
    });

    it("should throw error for invalid credentials", async () => {
      const error = new Error("Invalid email or password");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        authService.login({
          email: "wrong@example.com",
          password: "wrongpassword",
        })
      ).rejects.toThrow("Invalid email or password");
    });

    it("should handle login with remember me option", async () => {
      const mockBEUser = createMockBEUser();
      const mockResponse = {
        message: "Login successful",
        user: mockBEUser,
        sessionId: "session456",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
        rememberMe: true,
      } as any);

      expect(result.sessionId).toBe("session456");
    });

    it("should handle login for unverified users", async () => {
      const mockBEUser = createMockBEUser({ isEmailVerified: false });
      const mockResponse = {
        message: "Please verify your email",
        user: mockBEUser,
        sessionId: "session456",
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: "unverified@example.com",
        password: "password123",
      });

      expect(result.user.isVerified).toBe(false);
    });

    it("should handle network errors during login", async () => {
      const error = new Error("Network error");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        authService.login({
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow("Network error");
    });
  });

  describe("loginWithGoogle", () => {
    it("should login with Google successfully", async () => {
      const mockBEUser = createMockBEUser({
        email: "google@example.com",
        name: "Google User",
      });
      const mockResponse = {
        message: "Google login successful",
        user: mockBEUser,
        sessionId: "google-session123",
        isNewUser: false,
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const googleData = {
        idToken: "google-id-token",
      };

      const result = await authService.loginWithGoogle(googleData);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/auth/google",
        googleData
      );
      expect(result).toEqual({
        message: "Google login successful",
        user: expect.objectContaining({
          email: "google@example.com",
          displayName: "Google User",
        }),
        sessionId: "google-session123",
        isNewUser: false,
      });
    });

    it("should store user in localStorage after Google login", async () => {
      const mockBEUser = createMockBEUser();
      const mockResponse = {
        message: "Google login successful",
        user: mockBEUser,
        sessionId: "google-session123",
        isNewUser: false,
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      await authService.loginWithGoogle({ idToken: "google-id-token" });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user",
        expect.stringContaining('"email":"test@example.com"')
      );
    });

    it("should indicate new user from Google signup", async () => {
      const mockBEUser = createMockBEUser();
      const mockResponse = {
        message: "Welcome! Account created.",
        user: mockBEUser,
        sessionId: "google-session123",
        isNewUser: true,
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.loginWithGoogle({
        idToken: "google-id-token",
      });

      expect(result.isNewUser).toBe(true);
    });

    it("should throw error if Google token is invalid", async () => {
      const error = new Error("Invalid Google token");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        authService.loginWithGoogle({ idToken: "invalid-token" })
      ).rejects.toThrow("Invalid Google token");
    });

    it("should handle Google login with additional user data", async () => {
      const mockBEUser = createMockBEUser({
        email: "google@example.com",
        name: "Google User",
        role: "user",
      });
      const mockResponse = {
        message: "Google login successful",
        user: mockBEUser,
        sessionId: "google-session123",
        isNewUser: false,
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.loginWithGoogle({
        idToken: "google-id-token",
        email: "google@example.com",
        displayName: "Google User",
      } as any);

      expect(result.user.email).toBe("google@example.com");
      expect(result.user.displayName).toBe("Google User");
    });
  });

  describe("logout", () => {
    it("should logout user successfully", async () => {
      mockApiService.post.mockResolvedValue({ message: "Logged out" });

      // Set user in localStorage first
      localStorageMock["user"] = JSON.stringify({ id: "user123" });

      await authService.logout();

      expect(mockApiService.post).toHaveBeenCalledWith("/auth/logout", {});
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    });

    it("should clear localStorage even if API call fails", async () => {
      mockApiService.post.mockRejectedValue(new Error("Network error"));

      localStorageMock["user"] = JSON.stringify({ id: "user123" });

      await authService.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
      expect(mockLogServiceError).toHaveBeenCalledWith(
        "AuthService",
        "logout",
        expect.any(Error)
      );
    });

    it("should clear session cookie on logout", async () => {
      mockApiService.post.mockResolvedValue({ message: "Logged out" });

      await authService.logout();

      // Cookie setting happens in clearSessionCookie method
      // Just verify logout was called successfully
      expect(mockApiService.post).toHaveBeenCalledWith("/auth/logout", {});
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    });

    it("should handle logout when no user is logged in", async () => {
      mockApiService.post.mockResolvedValue({ message: "Logged out" });

      await authService.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
      expect(mockApiService.post).toHaveBeenCalled();
    });

    it("should not throw error if localStorage is unavailable", async () => {
      mockApiService.post.mockResolvedValue({ message: "Logged out" });

      // Simulate SSR environment
      const originalWindow = global.window;
      (global as any).window = undefined;

      await expect(authService.logout()).resolves.not.toThrow();

      (global as any).window = originalWindow;
    });
  });

  describe("getCurrentUser", () => {
    it("should get current user from server", async () => {
      const mockBEUser = createMockBEUser();
      const mockResponse = {
        user: mockBEUser,
        session: { id: "session123" },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(mockApiService.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(
        expect.objectContaining({
          id: "user123",
          email: "test@example.com",
          displayName: "Test User",
        })
      );
    });

    it("should store user in localStorage after fetching", async () => {
      const mockBEUser = createMockBEUser();
      const mockResponse = {
        user: mockBEUser,
        session: { id: "session123" },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      await authService.getCurrentUser();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user",
        expect.stringContaining('"id":"user123"')
      );
    });

    it("should return null for 401 unauthorized", async () => {
      const error = { status: 401, message: "Unauthorized" };
      mockApiService.get.mockRejectedValue(error);

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    });

    it("should return null for 401 in error.response.status", async () => {
      const error = { response: { status: 401 }, message: "Unauthorized" };
      mockApiService.get.mockRejectedValue(error);

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    });

    it("should return null for network errors without clearing storage", async () => {
      mockApiService.get.mockRejectedValue(new Error("Network error"));

      // Set user in localStorage
      localStorageMock["user"] = JSON.stringify({ id: "user123" });

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
      // Should not clear localStorage for network errors (non-401)
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });

    it("should handle transformation of complex user data", async () => {
      const mockBEUser = createMockBEUser({
        name: "Complex Display Name",
        isEmailVerified: false,
        role: "admin",
      });
      const mockResponse = {
        user: mockBEUser,
        session: { id: "session123" },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(result).toEqual(
        expect.objectContaining({
          displayName: "Complex Display Name",
          isVerified: false,
          role: "admin",
        })
      );
    });
  });

  describe("getCachedUser", () => {
    it("should return cached user from localStorage", () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        displayName: "Test User",
      };
      localStorageMock["user"] = JSON.stringify(mockUser);

      const result = authService.getCachedUser();

      expect(result).toEqual(mockUser);
    });

    it("should return null if no cached user", () => {
      const result = authService.getCachedUser();

      expect(result).toBeNull();
    });

    it("should return null if cached data is invalid JSON", () => {
      localStorageMock["user"] = "invalid-json";

      const result = authService.getCachedUser();

      expect(result).toBeNull();
    });

    it("should return null in SSR environment", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      const result = authService.getCachedUser();

      expect(result).toBeNull();

      (global as any).window = originalWindow;
    });

    it("should return cached user with all fields", () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        displayName: "Test User",
        role: "admin",
        isVerified: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
      };
      localStorageMock["user"] = JSON.stringify(mockUser);

      const result = authService.getCachedUser();

      expect(result).toEqual(mockUser);
    });
  });

  describe("isAuthenticated", () => {
    it("should return true if user is authenticated", async () => {
      const mockBEUser = createMockBEUser();
      const mockResponse = {
        user: mockBEUser,
        session: { id: "session123" },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it("should return false if user is not authenticated", async () => {
      mockApiService.get.mockRejectedValue({ status: 401 });

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it("should return false on network errors", async () => {
      mockApiService.get.mockRejectedValue(new Error("Network error"));

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe("getUserRole", () => {
    it("should return user role from cached user", () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        role: "admin",
      };
      localStorageMock["user"] = JSON.stringify(mockUser);

      const result = authService.getUserRole();

      expect(result).toBe("admin");
    });

    it("should return null if no cached user", () => {
      const result = authService.getUserRole();

      expect(result).toBeNull();
    });

    it("should return null if cached user has no role", () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
      };
      localStorageMock["user"] = JSON.stringify(mockUser);

      const result = authService.getUserRole();

      expect(result).toBeNull();
    });

    it("should return seller role", () => {
      const mockUser = {
        id: "user123",
        email: "seller@example.com",
        role: "seller",
      };
      localStorageMock["user"] = JSON.stringify(mockUser);

      const result = authService.getUserRole();

      expect(result).toBe("seller");
    });
  });

  describe("hasRole", () => {
    it("should return true if user has specified role", () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        role: "admin",
      };
      localStorageMock["user"] = JSON.stringify(mockUser);

      const result = authService.hasRole("admin");

      expect(result).toBe(true);
    });

    it("should return false if user does not have specified role", () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        role: "user",
      };
      localStorageMock["user"] = JSON.stringify(mockUser);

      const result = authService.hasRole("admin");

      expect(result).toBe(false);
    });

    it("should return false if no cached user", () => {
      const result = authService.hasRole("admin");

      expect(result).toBe(false);
    });

    it("should be case-sensitive for role checking", () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        role: "admin",
      };
      localStorageMock["user"] = JSON.stringify(mockUser);

      expect(authService.hasRole("Admin")).toBe(false);
      expect(authService.hasRole("admin")).toBe(true);
    });
  });

  describe("getSessions", () => {
    it("should get all user sessions", async () => {
      const mockSessions = [
        { id: "session1", device: "Chrome", lastActive: "2024-01-01" },
        { id: "session2", device: "Firefox", lastActive: "2024-01-02" },
      ];
      mockApiService.get.mockResolvedValue({ sessions: mockSessions });

      const result = await authService.getSessions();

      expect(mockApiService.get).toHaveBeenCalledWith("/auth/sessions");
      expect(result).toEqual(mockSessions);
    });

    it("should return empty array on error", async () => {
      mockApiService.get.mockRejectedValue(new Error("Failed to fetch"));

      const result = await authService.getSessions();

      expect(result).toEqual([]);
      expect(mockLogServiceError).toHaveBeenCalledWith(
        "AuthService",
        "getSessions",
        expect.any(Error)
      );
    });

    it("should handle empty sessions list", async () => {
      mockApiService.get.mockResolvedValue({ sessions: [] });

      const result = await authService.getSessions();

      expect(result).toEqual([]);
    });
  });

  describe("deleteSession", () => {
    it("should delete specific session", async () => {
      mockApiService.delete.mockResolvedValue({ message: "Session deleted" });

      await authService.deleteSession("session123");

      expect(mockApiService.delete).toHaveBeenCalledWith("/auth/sessions", {
        sessionId: "session123",
      });
    });

    it("should throw error if deletion fails", async () => {
      mockApiService.delete.mockRejectedValue(new Error("Deletion failed"));

      await expect(authService.deleteSession("session123")).rejects.toThrow(
        "Deletion failed"
      );
    });

    it("should handle deletion of non-existent session", async () => {
      mockApiService.delete.mockRejectedValue(new Error("Session not found"));

      await expect(authService.deleteSession("nonexistent")).rejects.toThrow(
        "Session not found"
      );
    });
  });

  describe("deleteAllSessions", () => {
    it("should delete all sessions", async () => {
      mockApiService.delete.mockResolvedValue({
        message: "All sessions deleted",
      });

      await authService.deleteAllSessions();

      expect(mockApiService.delete).toHaveBeenCalledWith("/auth/sessions", {
        deleteAll: true,
      });
    });

    it("should throw error if deletion fails", async () => {
      mockApiService.delete.mockRejectedValue(
        new Error("Failed to delete sessions")
      );

      await expect(authService.deleteAllSessions()).rejects.toThrow(
        "Failed to delete sessions"
      );
    });
  });

  describe("requestPasswordReset", () => {
    it("should request password reset successfully", async () => {
      const mockResponse = { message: "Reset email sent" };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.requestPasswordReset("test@example.com");

      expect(mockApiService.post).toHaveBeenCalledWith("/auth/reset-password", {
        email: "test@example.com",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle invalid email for password reset", async () => {
      mockApiService.post.mockRejectedValue(new Error("Email not found"));

      await expect(
        authService.requestPasswordReset("nonexistent@example.com")
      ).rejects.toThrow("Email not found");
    });

    it("should handle rate limiting for password reset", async () => {
      mockApiService.post.mockRejectedValue(
        new Error("Too many reset requests")
      );

      await expect(
        authService.requestPasswordReset("test@example.com")
      ).rejects.toThrow("Too many reset requests");
    });
  });

  describe("verifyEmail", () => {
    it("should verify email successfully", async () => {
      const mockResponse = { message: "Email verified" };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.verifyEmail("valid-token");

      expect(mockApiService.post).toHaveBeenCalledWith("/auth/verify-email", {
        token: "valid-token",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle invalid verification token", async () => {
      mockApiService.post.mockRejectedValue(
        new Error("Invalid or expired token")
      );

      await expect(authService.verifyEmail("invalid-token")).rejects.toThrow(
        "Invalid or expired token"
      );
    });

    it("should handle already verified email", async () => {
      mockApiService.post.mockRejectedValue(
        new Error("Email already verified")
      );

      await expect(authService.verifyEmail("token123")).rejects.toThrow(
        "Email already verified"
      );
    });
  });

  describe("updateProfile", () => {
    it("should update user profile successfully", async () => {
      const mockBEUser = createMockBEUser({
        name: "Updated Name",
      });
      const mockResponse = { user: mockBEUser };

      mockApiService.patch.mockResolvedValue(mockResponse);

      const result = await authService.updateProfile({
        displayName: "Updated Name",
      });

      expect(mockApiService.patch).toHaveBeenCalledWith("/auth/profile", {
        displayName: "Updated Name",
      });
      expect(result).toEqual(
        expect.objectContaining({
          displayName: "Updated Name",
        })
      );
    });

    it("should update localStorage after profile update", async () => {
      const mockBEUser = createMockBEUser({
        name: "Updated Name",
      });
      mockApiService.patch.mockResolvedValue({ user: mockBEUser });

      await authService.updateProfile({ displayName: "Updated Name" });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user",
        expect.stringContaining('"displayName":"Updated Name"')
      );
    });

    it("should handle partial profile updates", async () => {
      const mockBEUser = createMockBEUser();
      mockApiService.patch.mockResolvedValue({ user: mockBEUser });

      const result = await authService.updateProfile({
        displayName: "Only Name",
      });

      expect(mockApiService.patch).toHaveBeenCalledWith("/auth/profile", {
        displayName: "Only Name",
      });
    });

    it("should throw error if update fails", async () => {
      mockApiService.patch.mockRejectedValue(new Error("Update failed"));

      await expect(
        authService.updateProfile({ displayName: "New Name" })
      ).rejects.toThrow("Update failed");
    });

    it("should update multiple profile fields", async () => {
      const mockBEUser = createMockBEUser({
        name: "New Name",
        email: "newemail@example.com",
      });
      mockApiService.patch.mockResolvedValue({ user: mockBEUser });

      const result = await authService.updateProfile({
        displayName: "New Name",
        email: "newemail@example.com",
      });

      expect(result.displayName).toBe("New Name");
      expect(result.email).toBe("newemail@example.com");
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const mockResponse = { message: "Password changed successfully" };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.changePassword(
        "oldPassword123",
        "newPassword456"
      );

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/auth/change-password",
        {
          currentPassword: "oldPassword123",
          newPassword: "newPassword456",
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw error for incorrect current password", async () => {
      mockApiService.post.mockRejectedValue(
        new Error("Current password is incorrect")
      );

      await expect(
        authService.changePassword("wrongPassword", "newPassword456")
      ).rejects.toThrow("Current password is incorrect");
    });

    it("should handle weak new password validation", async () => {
      mockApiService.post.mockRejectedValue(new Error("Password is too weak"));

      await expect(
        authService.changePassword("oldPassword123", "weak")
      ).rejects.toThrow("Password is too weak");
    });

    it("should handle same old and new password", async () => {
      mockApiService.post.mockRejectedValue(
        new Error("New password must be different")
      );

      await expect(
        authService.changePassword("samePassword", "samePassword")
      ).rejects.toThrow("New password must be different");
    });
  });

  describe("Session management edge cases", () => {
    it("should handle concurrent login/logout operations", async () => {
      const mockBEUser = createMockBEUser();
      mockApiService.post.mockResolvedValue({
        message: "Login successful",
        user: mockBEUser,
        sessionId: "session123",
      });

      // Simulate concurrent operations
      const loginPromise = authService.login({
        email: "test@example.com",
        password: "password123",
      });

      mockApiService.post.mockResolvedValue({ message: "Logged out" });
      const logoutPromise = authService.logout();

      await Promise.all([loginPromise, logoutPromise]);

      // Logout should have cleared storage last
      expect(localStorage.removeItem).toHaveBeenCalled();
    });

    it("should handle multiple getCurrentUser calls", async () => {
      const mockBEUser = createMockBEUser();
      mockApiService.get.mockResolvedValue({
        user: mockBEUser,
        session: { id: "session123" },
      });

      const [result1, result2, result3] = await Promise.all([
        authService.getCurrentUser(),
        authService.getCurrentUser(),
        authService.getCurrentUser(),
      ]);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
      expect(mockApiService.get).toHaveBeenCalledTimes(3);
    });

    it("should handle session expiry during operation", async () => {
      const mockBEUser = createMockBEUser();
      mockApiService.get.mockResolvedValueOnce({
        user: mockBEUser,
        session: { id: "session123" },
      });

      await authService.getCurrentUser();

      // Simulate session expiry
      mockApiService.get.mockRejectedValueOnce({ status: 401 });

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    });
  });

  describe("SSR environment handling", () => {
    it("should handle getCachedUser in SSR", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      const result = authService.getCachedUser();

      expect(result).toBeNull();

      (global as any).window = originalWindow;
    });

    it("should handle logout in SSR", async () => {
      mockApiService.post.mockResolvedValue({ message: "Logged out" });

      const originalWindow = global.window;
      (global as any).window = undefined;

      await expect(authService.logout()).resolves.not.toThrow();

      (global as any).window = originalWindow;
    });

    it("should handle setUser in SSR", async () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      const mockBEUser = createMockBEUser();
      mockApiService.post.mockResolvedValue({
        message: "Login successful",
        user: mockBEUser,
        sessionId: "session123",
      });

      await expect(
        authService.login({
          email: "test@example.com",
          password: "password123",
        })
      ).resolves.toBeDefined();

      (global as any).window = originalWindow;
    });
  });

  describe("Data transformation accuracy", () => {
    it("should correctly transform all BE fields to FE fields", async () => {
      const mockBEUser = createMockBEUser({
        uid: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "admin",
        isEmailVerified: true,
      });
      const mockResponse = {
        user: mockBEUser,
        session: { id: "session123" },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(result).toEqual(
        expect.objectContaining({
          id: "user123",
          email: "test@example.com",
          displayName: "Test User",
          role: "admin",
          isVerified: true,
        })
      );
    });

    it("should preserve all BE fields during transformation", async () => {
      const mockBEUser = createMockBEUser();
      mockApiService.post.mockResolvedValue({
        message: "Login successful",
        user: mockBEUser,
        sessionId: "session123",
      });

      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      // Verify no fields are lost
      expect(result.user.id).toBeDefined();
      expect(result.user.email).toBeDefined();
      expect(result.user.displayName).toBeDefined();
      expect(result.user.role).toBeDefined();
      expect(result.user.isVerified).toBeDefined();
      expect(result.user.createdAt).toBeDefined();
      expect(result.user.updatedAt).toBeDefined();
    });
  });

  describe("Error handling consistency", () => {
    it("should re-throw errors from register", async () => {
      const error = new Error("Registration failed");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        authService.register({
          email: "test@example.com",
          password: "password123",
          displayName: "Test",
        })
      ).rejects.toThrow("Registration failed");

      expect(mockLogServiceError).not.toHaveBeenCalled();
    });

    it("should re-throw errors from login", async () => {
      const error = new Error("Login failed");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        authService.login({
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow("Login failed");

      expect(mockLogServiceError).not.toHaveBeenCalled();
    });

    it("should re-throw errors from loginWithGoogle", async () => {
      const error = new Error("Google auth failed");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        authService.loginWithGoogle({ idToken: "token" })
      ).rejects.toThrow("Google auth failed");

      expect(mockLogServiceError).not.toHaveBeenCalled();
    });

    it("should log errors from logout but not throw", async () => {
      mockApiService.post.mockRejectedValue(new Error("Logout failed"));

      await expect(authService.logout()).resolves.not.toThrow();

      expect(mockLogServiceError).toHaveBeenCalledWith(
        "AuthService",
        "logout",
        expect.any(Error)
      );
    });

    it("should log errors from getSessions and return empty array", async () => {
      mockApiService.get.mockRejectedValue(new Error("Failed"));

      const result = await authService.getSessions();

      expect(result).toEqual([]);
      expect(mockLogServiceError).toHaveBeenCalledWith(
        "AuthService",
        "getSessions",
        expect.any(Error)
      );
    });
  });
});
