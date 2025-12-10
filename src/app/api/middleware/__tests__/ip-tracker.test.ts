/**
 * Unit Tests for IP Tracker Middleware
 * Tests the withIPTracking wrapper functionality
 */

import { logError } from "@/lib/firebase-error-logger";
import { ipTrackerService } from "@/services/ip-tracker.service";
import { withIPTracking } from "../ip-tracker";

jest.mock("@/services/ip-tracker.service");
jest.mock("@/lib/firebase-error-logger");

describe("IP Tracker Middleware", () => {
  let mockRequest: Request;
  let mockHandler: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      url: "http://localhost:3000/api/test",
      method: "POST",
      headers: new Headers({
        "x-forwarded-for": "192.168.1.1",
        "user-agent": "Test Agent",
      }),
    } as Request;

    mockHandler = jest.fn();

    (ipTrackerService.getIPFromRequest as jest.Mock).mockReturnValue(
      "192.168.1.1"
    );
    (ipTrackerService.getUserAgentFromRequest as jest.Mock).mockReturnValue(
      "Test Agent"
    );
    (ipTrackerService.checkRateLimit as jest.Mock).mockResolvedValue({
      allowed: true,
      remainingAttempts: 5,
      resetAt: new Date(),
    });
    (ipTrackerService.logActivity as jest.Mock).mockResolvedValue(undefined);
  });

  it("should track successful API calls", async () => {
    const mockResponse = { ok: true, status: 200 } as Response;
    mockHandler.mockResolvedValue(mockResponse);

    const wrapped = withIPTracking(mockHandler, "login");
    await wrapped(mockRequest);

    expect(ipTrackerService.logActivity).toHaveBeenCalledWith({
      ipAddress: "192.168.1.1",
      userAgent: "Test Agent",
      action: "login",
      userId: undefined,
      metadata: { statusCode: 200 },
    });
  });

  it("should track failed API calls", async () => {
    const mockResponse = { ok: false, status: 400 } as Response;
    mockHandler.mockResolvedValue(mockResponse);

    const wrapped = withIPTracking(mockHandler, "login");
    await wrapped(mockRequest);

    expect(ipTrackerService.logActivity).toHaveBeenCalledWith({
      ipAddress: "192.168.1.1",
      userAgent: "Test Agent",
      action: "login_failed",
      userId: undefined,
      metadata: { statusCode: 400 },
    });
  });

  it("should check rate limits when enabled", async () => {
    const mockResponse = { ok: true, status: 200 } as Response;
    mockHandler.mockResolvedValue(mockResponse);

    const wrapped = withIPTracking(mockHandler, {
      action: "login",
      checkRateLimit: true,
      maxAttempts: 5,
      windowMinutes: 15,
    });
    await wrapped(mockRequest);

    expect(ipTrackerService.checkRateLimit).toHaveBeenCalledWith({
      ipAddress: "192.168.1.1",
      action: "login",
      maxAttempts: 5,
      windowMs: 900000,
    });
  });

  it("should block when rate limit exceeded", async () => {
    (ipTrackerService.checkRateLimit as jest.Mock).mockResolvedValue({
      allowed: false,
      remainingAttempts: 0,
      resetAt: new Date("2024-12-15T12:00:00Z"),
    });

    const wrapped = withIPTracking(mockHandler, {
      action: "login",
      checkRateLimit: true,
    });
    const response = await wrapped(mockRequest);

    expect(mockHandler).not.toHaveBeenCalled();
    expect(response.status).toBe(429);
  });

  it("should extract user ID when function provided", async () => {
    const mockResponse = { ok: true, status: 200 } as Response;
    mockHandler.mockResolvedValue(mockResponse);
    const extractUserId = jest.fn().mockResolvedValue("user-123");

    const wrapped = withIPTracking(mockHandler, {
      action: "api_call",
      extractUserId,
    });
    await wrapped(mockRequest);

    expect(extractUserId).toHaveBeenCalledWith(mockRequest);
    expect(ipTrackerService.logActivity).toHaveBeenCalledWith({
      ipAddress: "192.168.1.1",
      userAgent: "Test Agent",
      action: "api_call",
      userId: "user-123",
      metadata: { statusCode: 200 },
    });
  });

  it("should handle errors gracefully", async () => {
    mockHandler.mockRejectedValue(new Error("Test error"));

    const wrapped = withIPTracking(mockHandler, "test");

    // The wrapped function will try to call handler twice if it fails
    // First call throws, catches error, then calls handler again which throws
    await expect(wrapped(mockRequest)).rejects.toThrow("Test error");

    expect(logError).toHaveBeenCalled();
  });

  it("should not log activity on rate limit", async () => {
    (ipTrackerService.checkRateLimit as jest.Mock).mockResolvedValue({
      allowed: false,
      remainingAttempts: 0,
      resetAt: new Date(),
    });

    const wrapped = withIPTracking(mockHandler, {
      action: "login",
      checkRateLimit: true,
    });
    await wrapped(mockRequest);

    // Should log rate_limited activity, not regular activity
    expect(ipTrackerService.logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "login_rate_limited",
      })
    );
    expect(ipTrackerService.logActivity).toHaveBeenCalledTimes(1);
  });
});
