import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockDemoSeed,
  mockRequireAuthUser,
  mockRequireRoleUser,
} = vi.hoisted(() => ({
  mockDemoSeed: vi.fn(),
  mockRequireAuthUser: vi.fn(),
  mockRequireRoleUser: vi.fn(),
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
  demoSeed: mockDemoSeed,
}));

// Provide auth guards in case the action ever tries to import them
vi.mock("@mohasinac/appkit", () => ({
  requireAuthUser: mockRequireAuthUser,
  requireRoleUser: mockRequireRoleUser,
}));

import { demoSeedAction } from "../demo-seed.actions";

describe("demoSeedAction — CONFIRMED BUG: no server-side auth guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDemoSeed.mockResolvedValue({ created: 50, updated: 0, errors: 0 });
  });

  it("calling with action:'load' → demoSeed called with ({ action:'load', ... }, baseUrl)", async () => {
    await demoSeedAction({ action: "load" });
    expect(mockDemoSeed).toHaveBeenCalledWith(
      { action: "load", collections: undefined, dryRun: undefined },
      expect.any(String),
    );
  });

  it("calling with action:'delete' → demoSeed called with ({ action:'delete', ... }, baseUrl)", async () => {
    await demoSeedAction({ action: "delete" });
    expect(mockDemoSeed).toHaveBeenCalledWith(
      { action: "delete", collections: undefined, dryRun: undefined },
      expect.any(String),
    );
  });

  it("collections array forwarded to demoSeed", async () => {
    await demoSeedAction({ action: "load", collections: ["users", "products"] as any });
    const call = mockDemoSeed.mock.calls[0];
    expect(call[0].collections).toEqual(["users", "products"]);
  });

  it("dryRun:true forwarded to demoSeed", async () => {
    await demoSeedAction({ action: "load", dryRun: true });
    const call = mockDemoSeed.mock.calls[0];
    expect(call[0].dryRun).toBe(true);
  });

  it("baseUrl read from process.env.NEXT_PUBLIC_APP_URL", async () => {
    const originalEnv = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://letitrip.in";
    await demoSeedAction({ action: "load" });
    const call = mockDemoSeed.mock.calls[0];
    expect(call[1]).toBe("https://letitrip.in");
    process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  it("baseUrl falls back to http://localhost:3000 when env not set", async () => {
    const originalEnv = process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    await demoSeedAction({ action: "load" });
    const call = mockDemoSeed.mock.calls[0];
    expect(call[1]).toBe("http://localhost:3000");
    process.env.NEXT_PUBLIC_APP_URL = originalEnv;
  });

  it("BUG: no requireAuthUser call — unauthenticated callers can invoke this", async () => {
    await demoSeedAction({ action: "load" });
    // This test documents the confirmed security bug:
    // any caller (authenticated OR unauthenticated) can trigger seed operations
    expect(mockRequireAuthUser).not.toHaveBeenCalled();
    expect(mockRequireRoleUser).not.toHaveBeenCalled();
  });

  it("returns { ok: true, data: SeedOperationResult } on success", async () => {
    const result = await demoSeedAction({ action: "load" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toMatchObject({ created: 50, updated: 0, errors: 0 });
    }
  });

  it("demoSeed throws → { ok: false } (wrapAction captures)", async () => {
    mockDemoSeed.mockRejectedValue(new Error("Seed operation failed"));
    const result = await demoSeedAction({ action: "load" });
    expect(result.ok).toBe(false);
  });
});
