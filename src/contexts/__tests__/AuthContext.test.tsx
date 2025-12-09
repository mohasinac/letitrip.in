import { logError } from "@/lib/firebase-error-logger";
import { authService } from "@/services/auth.service";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { AuthProvider, useAuth } from "../AuthContext";

// Mock dependencies
jest.mock("@/services/auth.service");
jest.mock("@/lib/firebase-error-logger");

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;

describe("AuthContext", () => {
  const mockUser = {
    id: "user123",
    uid: "user123",
    email: "test@example.com",
    displayName: "Test User",
    role: "buyer",
    isAdmin: false,
    isSeller: false,
    isVerified: true,
    createdAt: "2024-01-01",
  };

  const mockAdminUser = {
    ...mockUser,
    role: "admin",
    isAdmin: true,
  };

  const mockSellerUser = {
    ...mockUser,
    role: "seller",
    isSeller: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe("Initialization", () => {
    it("should initialize with loading state", () => {
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should load cached user immediately and then validate with server", async () => {
      mockAuthService.getCachedUser.mockReturnValue(mockUser);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Should show cached user immediately
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.loading).toBe(false);
      });

      // Should validate with server
      await waitFor(() => {
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
      });
    });

    it("should handle case where cached user exists but server validation fails", async () => {
      mockAuthService.getCachedUser.mockReturnValue(mockUser);
      mockAuthService.getCurrentUser.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBe(null);
        expect(result.current.loading).toBe(false);
      });
    });

    it("should handle initialization errors", async () => {
      const error = new Error("Init failed");
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBe(null);
        expect(result.current.loading).toBe(false);
        expect(mockLogError).toHaveBeenCalledWith(error, {
          component: "AuthContext.initializeAuth",
        });
      });
    });
  });

  describe("Login", () => {
    it("should login successfully", async () => {
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockResolvedValue(null);
      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        token: "token123",
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loginResponse;
      await act(async () => {
        loginResponse = await result.current.login(
          "test@example.com",
          "password123"
        );
      });

      expect(loginResponse).toEqual({
        user: mockUser,
        token: "token123",
      });
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should handle login failure", async () => {
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockResolvedValue(null);
      const error = new Error("Invalid credentials");
      mockAuthService.login.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login("test@example.com", "wrong");
        })
      ).rejects.toThrow("Invalid credentials");

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should set loading to false after login error", async () => {
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockResolvedValue(null);
      mockAuthService.login.mockRejectedValue(new Error("Login failed"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login("test@example.com", "password");
        })
      ).rejects.toThrow();

      expect(result.current.loading).toBe(false);
    });
  });

  describe("Login with Google", () => {
    it("should login with Google successfully", async () => {
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockResolvedValue(null);
      mockAuthService.loginWithGoogle.mockResolvedValue({
        user: mockUser,
        token: "token123",
        isNewUser: false,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loginResponse;
      await act(async () => {
        loginResponse = await result.current.loginWithGoogle("idToken123", {
          displayName: "Test User",
          email: "test@example.com",
          photoURL: "https://example.com/photo.jpg",
        });
      });

      expect(loginResponse).toEqual({
        user: mockUser,
        token: "token123",
        isNewUser: false,
      });
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should handle Google login with new user", async () => {
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockResolvedValue(null);
      mockAuthService.loginWithGoogle.mockResolvedValue({
        user: mockUser,
        token: "token123",
        isNewUser: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loginResponse;
      await act(async () => {
        loginResponse = await result.current.loginWithGoogle("idToken123");
      });

      expect(loginResponse?.isNewUser).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it("should handle Google login failure", async () => {
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockResolvedValue(null);
      const error = new Error("Google auth failed");
      mockAuthService.loginWithGoogle.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.loginWithGoogle("idToken123");
        })
      ).rejects.toThrow("Google auth failed");

      expect(result.current.user).toBe(null);
      expect(result.current.loading).toBe(false);
    });
  });

  describe("Register", () => {
    it("should register successfully", async () => {
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockResolvedValue(null);
      mockAuthService.register.mockResolvedValue({
        user: mockUser,
        token: "token123",
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let registerResponse;
      await act(async () => {
        registerResponse = await result.current.register({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        });
      });

      expect(registerResponse).toEqual({
        user: mockUser,
        token: "token123",
      });
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should register with custom role", async () => {
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockResolvedValue(null);
      mockAuthService.register.mockResolvedValue({
        user: mockSellerUser,
        token: "token123",
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.register({
          email: "seller@example.com",
          password: "password123",
          name: "Test Seller",
          role: "seller",
        });
      });

      expect(result.current.user).toEqual(mockSellerUser);
      expect(result.current.isSeller).toBe(true);
    });

    it("should handle registration failure", async () => {
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockResolvedValue(null);
      const error = new Error("Email already exists");
      mockAuthService.register.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.register({
            email: "test@example.com",
            password: "password123",
            name: "Test User",
          });
        })
      ).rejects.toThrow("Email already exists");

      expect(result.current.user).toBe(null);
      expect(result.current.loading).toBe(false);
    });
  });

  describe("Logout", () => {
    it("should logout successfully", async () => {
      mockAuthService.getCachedUser.mockReturnValue(mockUser);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockAuthService.logout.mockResolvedValue();

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should handle logout errors gracefully", async () => {
      mockAuthService.getCachedUser.mockReturnValue(mockUser);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      const error = new Error("Logout failed");
      mockAuthService.logout.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBe(null);
      expect(mockLogError).toHaveBeenCalledWith(error, {
        component: "AuthContext.logout",
      });
    });

    it("should clear user even if logout API fails", async () => {
      mockAuthService.getCachedUser.mockReturnValue(mockUser);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockAuthService.logout.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBe(null);
    });
  });

  describe("Refresh User", () => {
    it("should refresh user data", async () => {
      mockAuthService.getCachedUser.mockReturnValue(mockUser);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      const updatedUser = { ...mockUser, displayName: "Updated Name" };
      mockAuthService.getCurrentUser.mockResolvedValue(updatedUser);

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user).toEqual(updatedUser);
    });

    it("should handle refresh failure", async () => {
      mockAuthService.getCachedUser.mockReturnValue(mockUser);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      const error = new Error("Refresh failed");
      mockAuthService.getCurrentUser.mockRejectedValue(error);

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user).toBe(null);
      expect(mockLogError).toHaveBeenCalledWith(error, {
        component: "AuthContext.refreshUser",
      });
    });

    it("should clear user if refresh returns null", async () => {
      mockAuthService.getCachedUser.mockReturnValue(mockUser);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      mockAuthService.getCurrentUser.mockResolvedValue(null);

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user).toBe(null);
    });
  });

  describe("Computed Properties", () => {
    it("should compute isAdmin correctly", async () => {
      mockAuthService.getCachedUser.mockReturnValue(mockAdminUser);
      mockAuthService.getCurrentUser.mockResolvedValue(mockAdminUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true);
        expect(result.current.isSeller).toBe(false);
        expect(result.current.isAdminOrSeller).toBe(true);
      });
    });

    it("should compute isSeller correctly", async () => {
      mockAuthService.getCachedUser.mockReturnValue(mockSellerUser);
      mockAuthService.getCurrentUser.mockResolvedValue(mockSellerUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(false);
        expect(result.current.isSeller).toBe(true);
        expect(result.current.isAdminOrSeller).toBe(true);
      });
    });

    it("should compute properties for regular user", async () => {
      mockAuthService.getCachedUser.mockReturnValue(mockUser);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(false);
        expect(result.current.isSeller).toBe(false);
        expect(result.current.isAdminOrSeller).toBe(false);
      });
    });

    it("should handle null user for computed properties", async () => {
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(false);
        expect(result.current.isSeller).toBe(false);
        expect(result.current.isAdminOrSeller).toBe(false);
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe("Hook Error Handling", () => {
    it("should throw error when useAuth is used outside provider", () => {
      // Temporarily suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid login/logout cycles", async () => {
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockResolvedValue(null);
      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        token: "token123",
      });
      mockAuthService.logout.mockResolvedValue();

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Login
      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });
      expect(result.current.user).toEqual(mockUser);

      // Logout
      await act(async () => {
        await result.current.logout();
      });
      expect(result.current.user).toBe(null);

      // Login again
      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });
      expect(result.current.user).toEqual(mockUser);
    });

    it("should handle concurrent operations", async () => {
      mockAuthService.getCachedUser.mockReturnValue(null);
      mockAuthService.getCurrentUser.mockResolvedValue(null);
      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        token: "token123",
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Attempt multiple logins concurrently
      await act(async () => {
        await Promise.all([
          result.current.login("test@example.com", "password123"),
          result.current.login("test@example.com", "password123"),
        ]);
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it("should maintain state consistency after multiple refresh calls", async () => {
      mockAuthService.getCachedUser.mockReturnValue(mockUser);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      const updatedUser1 = { ...mockUser, displayName: "Name 1" };
      const updatedUser2 = { ...mockUser, displayName: "Name 2" };

      mockAuthService.getCurrentUser
        .mockResolvedValueOnce(updatedUser1)
        .mockResolvedValueOnce(updatedUser2);

      await act(async () => {
        await Promise.all([
          result.current.refreshUser(),
          result.current.refreshUser(),
        ]);
      });

      // Should have the last resolved user
      expect(result.current.user).toBeTruthy();
    });
  });
});
