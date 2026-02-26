/**
 * Auth Service Unit Tests
 */
import { apiClient } from "@/lib/api-client";
import { authService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");

const mockPost = jest.mocked(apiClient.post);

describe("authService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("login() calls POST with email and password", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = { email: "user@test.com", password: "pass123" };
    await authService.login(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGIN, data);
  });

  it("register() calls POST with email, password and displayName", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    const data = {
      email: "user@test.com",
      password: "pass123",
      displayName: "User",
    };
    await authService.register(data);
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.REGISTER, data);
  });

  it("logout() calls POST logout endpoint with empty object", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await authService.logout();
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGOUT, {});
  });

  it("sendVerification() calls POST with email", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await authService.sendVerification({ email: "user@test.com" });
    expect(mockPost).toHaveBeenCalledWith(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      { email: "user@test.com" },
    );
  });

  it("verifyEmail() calls POST with token", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await authService.verifyEmail({ token: "tok_abc" });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      token: "tok_abc",
    });
  });

  it("forgotPassword() calls POST with email", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await authService.forgotPassword({ email: "user@test.com" });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email: "user@test.com",
    });
  });

  it("resetPassword() calls POST with token and password", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await authService.resetPassword({ token: "tok_abc", password: "newpass" });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token: "tok_abc",
      password: "newpass",
    });
  });

  it("changePassword() calls POST change-password with current and new password", async () => {
    mockPost.mockResolvedValueOnce({} as never);
    await authService.changePassword({
      currentPassword: "old",
      newPassword: "new",
    });
    expect(mockPost).toHaveBeenCalledWith(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
      currentPassword: "old",
      newPassword: "new",
    });
  });
});
