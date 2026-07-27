import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockIssueRealtimeToken,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockIssueRealtimeToken: vi.fn(),
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  requireAuthUser: mockRequireAuthUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } },
  issueRealtimeToken: mockIssueRealtimeToken,
}));

import { getRealtimeTokenAction } from "../realtime-token.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", role: "user", ...overrides };
}

describe("getRealtimeTokenAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockIssueRealtimeToken.mockResolvedValue({ token: "rtdb-token-abc", expiresAt: Date.now() + 3600000 });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await getRealtimeTokenAction();
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded (STRICT) → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await getRealtimeTokenAction();
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toMatch(/too many/i);
  });

  it("rate limit key is realtime:token:{uid}", async () => {
    await getRealtimeTokenAction();
    expect(mockRateLimitByIdentifier).toHaveBeenCalledWith(
      "realtime:token:user-buyer-1",
      expect.anything(),
    );
  });

  it("user has role 'seller' → issueRealtimeToken called with (uid, 'seller')", async () => {
    mockRequireAuthUser.mockResolvedValue(makeUser({ role: "seller" }));
    await getRealtimeTokenAction();
    expect(mockIssueRealtimeToken).toHaveBeenCalledWith("user-buyer-1", "seller");
  });

  it("user has role 'admin' → issueRealtimeToken called with (uid, 'admin')", async () => {
    mockRequireAuthUser.mockResolvedValue(makeUser({ role: "admin" }));
    await getRealtimeTokenAction();
    expect(mockIssueRealtimeToken).toHaveBeenCalledWith("user-buyer-1", "admin");
  });

  it("user.role is undefined → issueRealtimeToken called with (uid, 'user') — fallback", async () => {
    mockRequireAuthUser.mockResolvedValue({ uid: "user-buyer-1", email: "buyer@test.com" });
    await getRealtimeTokenAction();
    expect(mockIssueRealtimeToken).toHaveBeenCalledWith("user-buyer-1", "user");
  });

  it("valid → { ok: true, data: { token, expiresAt } }", async () => {
    const result = await getRealtimeTokenAction();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toMatchObject({ token: "rtdb-token-abc" });
    }
  });

  it("issueRealtimeToken throws → { ok: false }", async () => {
    mockIssueRealtimeToken.mockRejectedValue(new Error("Token service error"));
    const result = await getRealtimeTokenAction();
    expect(result.ok).toBe(false);
  });
});
