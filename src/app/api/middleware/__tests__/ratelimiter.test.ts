/**
 * Unit Tests for Rate Limiter Middleware
 */

import {
  apiRateLimiter,
  authRateLimiter,
  strictRateLimiter,
} from "@/app/api/lib/utils/rate-limiter";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "../../lib/utils/ip-utils";
import { rateLimit, withRateLimit } from "../ratelimiter";

jest.mock("@/app/api/lib/utils/rate-limiter");
jest.mock("../../lib/utils/ip-utils");

describe("Rate Limiter Middleware", () => {
  let mockRequest: NextRequest;
  let mockHandler: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      url: "http://localhost:3000/api/test",
      method: "POST",
      headers: new Headers(),
      nextUrl: { pathname: "/api/test" },
    } as any;

    mockHandler = jest
      .fn()
      .mockResolvedValue(NextResponse.json({ success: true }));

    (getClientIp as jest.Mock).mockReturnValue("192.168.1.1");
    (apiRateLimiter.check as jest.Mock).mockReturnValue(true);
    (authRateLimiter.check as jest.Mock).mockReturnValue(true);
    (strictRateLimiter.check as jest.Mock).mockReturnValue(true);
  });

  it("should allow requests when not rate limited", async () => {
    const middleware = rateLimit();
    const result = await middleware(mockRequest);

    expect(apiRateLimiter.check).toHaveBeenCalledWith("192.168.1.1");
    expect(result).toBeNull();
  });

  it("should block when rate limited", async () => {
    (apiRateLimiter.check as jest.Mock).mockReturnValue(false);

    const middleware = rateLimit();
    const result = await middleware(mockRequest);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result?.status).toBe(429);
  });

  it("should use correct limiter type", async () => {
    await rateLimit({ limiterType: "auth" })(mockRequest);
    expect(authRateLimiter.check).toHaveBeenCalled();

    jest.clearAllMocks();
    await rateLimit({ limiterType: "search" })(mockRequest);
    expect(strictRateLimiter.check).toHaveBeenCalled();
  });

  it("should return error message", async () => {
    (apiRateLimiter.check as jest.Mock).mockReturnValue(false);

    const result = await rateLimit({ message: "Custom error" })(mockRequest);
    const body = await result?.json();

    expect(body.error).toBe("Custom error");
  });

  it("should fail open on errors", async () => {
    (getClientIp as jest.Mock).mockImplementation(() => {
      throw new Error("Test error");
    });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const result = await rateLimit()(mockRequest);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should work with withRateLimit wrapper", async () => {
    const result = await withRateLimit(mockRequest, mockHandler);

    expect(mockHandler).toHaveBeenCalled();
    expect(result).toEqual(NextResponse.json({ success: true }));
  });

  it("should block in wrapper when rate limited", async () => {
    (apiRateLimiter.check as jest.Mock).mockReturnValue(false);

    const result = await withRateLimit(mockRequest, mockHandler);

    expect(mockHandler).not.toHaveBeenCalled();
    expect(result.status).toBe(429);
  });
});
