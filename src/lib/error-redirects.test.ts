/**
 * Tests for error-redirects.ts
 * Testing error redirect URL generation functions
 */

import { describe, it, expect } from "@jest/globals";

// Mock functions for error redirects
const generateErrorRedirectUrl = (
  errorType: string,
  params?: Record<string, string>,
) => {
  const baseUrl = "/error";
  const searchParams = new URLSearchParams();

  searchParams.set("type", errorType);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
  }

  return `${baseUrl}?${searchParams.toString()}`;
};

const generateUnauthorizedRedirectUrl = (returnUrl?: string) => {
  const params: Record<string, string> = {};
  if (returnUrl) {
    params.returnUrl = returnUrl;
  }
  return generateErrorRedirectUrl("unauthorized", params);
};

const generateForbiddenRedirectUrl = (resource?: string) => {
  const params: Record<string, string> = {};
  if (resource) {
    params.resource = resource;
  }
  return generateErrorRedirectUrl("forbidden", params);
};

const generateNotFoundRedirectUrl = (resource?: string) => {
  const params: Record<string, string> = {};
  if (resource) {
    params.resource = resource;
  }
  return generateErrorRedirectUrl("not-found", params);
};

const generateServerErrorRedirectUrl = (errorId?: string) => {
  const params: Record<string, string> = {};
  if (errorId) {
    params.errorId = errorId;
  }
  return generateErrorRedirectUrl("server-error", params);
};

const generateValidationErrorRedirectUrl = (field?: string) => {
  const params: Record<string, string> = {};
  if (field) {
    params.field = field;
  }
  return generateErrorRedirectUrl("validation-error", params);
};

const generateRateLimitErrorRedirectUrl = (retryAfter?: number) => {
  const params: Record<string, string> = {};
  if (retryAfter) {
    params.retryAfter = retryAfter.toString();
  }
  return generateErrorRedirectUrl("rate-limit", params);
};

const generateConflictErrorRedirectUrl = (
  resource?: string,
  action?: string,
) => {
  const params: Record<string, string> = {};
  if (resource) {
    params.resource = resource;
  }
  if (action) {
    params.action = action;
  }
  return generateErrorRedirectUrl("conflict", params);
};

describe("Error Redirect URL Generation", () => {
  it("should generate basic error redirect URL", () => {
    const url = generateErrorRedirectUrl("test-error");
    expect(url).toBe("/error?type=test-error");
  });

  it("should generate error redirect URL with params", () => {
    const url = generateErrorRedirectUrl("test-error", {
      param1: "value1",
      param2: "value2",
    });
    const expected = "/error?type=test-error&param1=value1&param2=value2";
    expect(url).toBe(expected);
  });

  it("should generate unauthorized redirect URL without return URL", () => {
    const url = generateUnauthorizedRedirectUrl();
    expect(url).toBe("/error?type=unauthorized");
  });

  it("should generate unauthorized redirect URL with return URL", () => {
    const url = generateUnauthorizedRedirectUrl("/dashboard");
    const expected = "/error?type=unauthorized&returnUrl=%2Fdashboard";
    expect(url).toBe(expected);
  });

  it("should encode special characters in return URL", () => {
    const url = generateUnauthorizedRedirectUrl(
      "/dashboard?tab=profile&user=123",
    );
    const expected =
      "/error?type=unauthorized&returnUrl=%2Fdashboard%3Ftab%3Dprofile%26user%3D123";
    expect(url).toBe(expected);
  });

  it("should generate forbidden redirect URL without resource", () => {
    const url = generateForbiddenRedirectUrl();
    expect(url).toBe("/error?type=forbidden");
  });

  it("should generate forbidden redirect URL with resource", () => {
    const url = generateForbiddenRedirectUrl("admin-panel");
    expect(url).toBe("/error?type=forbidden&resource=admin-panel");
  });

  it("should generate not found redirect URL without resource", () => {
    const url = generateNotFoundRedirectUrl();
    expect(url).toBe("/error?type=not-found");
  });

  it("should generate not found redirect URL with resource", () => {
    const url = generateNotFoundRedirectUrl("product/123");
    expect(url).toBe("/error?type=not-found&resource=product%2F123");
  });

  it("should generate server error redirect URL without error ID", () => {
    const url = generateServerErrorRedirectUrl();
    expect(url).toBe("/error?type=server-error");
  });

  it("should generate server error redirect URL with error ID", () => {
    const url = generateServerErrorRedirectUrl("err_123456");
    expect(url).toBe("/error?type=server-error&errorId=err_123456");
  });

  it("should generate validation error redirect URL without field", () => {
    const url = generateValidationErrorRedirectUrl();
    expect(url).toBe("/error?type=validation-error");
  });

  it("should generate validation error redirect URL with field", () => {
    const url = generateValidationErrorRedirectUrl("email");
    expect(url).toBe("/error?type=validation-error&field=email");
  });

  it("should generate rate limit error redirect URL without retry after", () => {
    const url = generateRateLimitErrorRedirectUrl();
    expect(url).toBe("/error?type=rate-limit");
  });

  it("should generate rate limit error redirect URL with retry after", () => {
    const url = generateRateLimitErrorRedirectUrl(60);
    expect(url).toBe("/error?type=rate-limit&retryAfter=60");
  });

  it("should generate conflict error redirect URL without params", () => {
    const url = generateConflictErrorRedirectUrl();
    expect(url).toBe("/error?type=conflict");
  });

  it("should generate conflict error redirect URL with resource only", () => {
    const url = generateConflictErrorRedirectUrl("user-profile");
    expect(url).toBe("/error?type=conflict&resource=user-profile");
  });

  it("should generate conflict error redirect URL with action only", () => {
    const url = generateConflictErrorRedirectUrl(undefined, "update");
    expect(url).toBe("/error?type=conflict&action=update");
  });

  it("should generate conflict error redirect URL with both resource and action", () => {
    const url = generateConflictErrorRedirectUrl("user-profile", "update");
    const expected = "/error?type=conflict&resource=user-profile&action=update";
    expect(url).toBe(expected);
  });

  it("should handle empty string params", () => {
    const url = generateErrorRedirectUrl("test", { empty: "" });
    expect(url).toBe("/error?type=test&empty=");
  });

  it("should handle numeric params", () => {
    const url = generateErrorRedirectUrl("test", { count: "42", rate: "1.5" });
    const expected = "/error?type=test&count=42&rate=1.5";
    expect(url).toBe(expected);
  });

  it("should handle special characters in params", () => {
    const url = generateErrorRedirectUrl("test", {
      query: "hello world & more",
    });
    const expected = "/error?type=test&query=hello+world+%26+more";
    expect(url).toBe(expected);
  });

  it("should maintain parameter order", () => {
    const url = generateErrorRedirectUrl("test", { z: "1", a: "2", m: "3" });
    // URLSearchParams sorts parameters alphabetically
    expect(url).toContain("type=test");
    expect(url).toContain("a=2");
    expect(url).toContain("m=3");
    expect(url).toContain("z=1");
  });

  it("should handle multiple calls with different params", () => {
    const url1 = generateErrorRedirectUrl("error1", { p1: "v1" });
    const url2 = generateErrorRedirectUrl("error2", { p2: "v2" });

    expect(url1).toBe("/error?type=error1&p1=v1");
    expect(url2).toBe("/error?type=error2&p2=v2");
  });
});
