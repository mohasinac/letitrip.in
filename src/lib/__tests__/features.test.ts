import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

// We need to reset the React cache between tests since getFlag uses React.cache
// We re-import the module to get a fresh cache for each test group.

describe("getFlag", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clean up all FEATURE_ env vars
    for (const key of Object.keys(process.env)) {
      if (key.startsWith("FEATURE_")) {
        delete process.env[key];
      }
    }
    // Clear the module cache so React.cache resets between tests
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  test("returns false when env var is unset", async () => {
    const { getFlag } = await import("../features");
    expect(getFlag("AUCTIONS")).toBe(false);
  });

  test("returns false when env var = 'false'", async () => {
    process.env["FEATURE_AUCTIONS"] = "false";
    const { getFlag } = await import("../features");
    expect(getFlag("AUCTIONS")).toBe(false);
  });

  test("returns true when env var = 'true'", async () => {
    process.env["FEATURE_AUCTIONS"] = "true";
    const { getFlag } = await import("../features");
    expect(getFlag("AUCTIONS")).toBe(true);
  });

  test("is case-insensitive (TRUE, True → true)", async () => {
    process.env["FEATURE_BLOG"] = "TRUE";
    const { getFlag } = await import("../features");
    expect(getFlag("BLOG")).toBe(true);

    vi.resetModules();
    process.env["FEATURE_BLOG"] = "True";
    const { getFlag: getFlag2 } = await import("../features");
    expect(getFlag2("BLOG")).toBe(true);
  });
});

describe("withFeatureGuard", () => {
  beforeEach(() => {
    for (const key of Object.keys(process.env)) {
      if (key.startsWith("FEATURE_")) delete process.env[key];
    }
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  test("returns 404 when flag is off", async () => {
    const { withFeatureGuard } = await import("../features");
    const handler = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    const guarded = withFeatureGuard("AUCTIONS", handler);
    const res = await guarded(new Request("https://test.com/api/auctions"));
    expect((res as Response).status).toBe(404);
    expect(handler).not.toHaveBeenCalled();
  });

  test("calls handler when flag is on", async () => {
    process.env["FEATURE_EVENTS"] = "true";
    const { withFeatureGuard } = await import("../features");
    const mockResponse = new Response("ok", { status: 200 });
    const handler = vi.fn().mockResolvedValue(mockResponse);
    const guarded = withFeatureGuard("EVENTS", handler);
    const req = new Request("https://test.com/api/events");
    const res = await guarded(req);
    expect(handler).toHaveBeenCalledWith(req);
    expect(res).toBe(mockResponse);
  });
});
