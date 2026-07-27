import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireRoleUser,
  mockRateLimitByIdentifier,
  mockGetSiteSettings,
  mockUpdateSiteSettings,
} = vi.hoisted(() => ({
  mockRequireRoleUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockGetSiteSettings: vi.fn(),
  mockUpdateSiteSettings: vi.fn(),
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
  requireRoleUser: mockRequireRoleUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } },
  getSiteSettings: mockGetSiteSettings,
  updateSiteSettings: mockUpdateSiteSettings,
}));

import {
  getSiteSettingsAction,
  updateSiteSettingsAction,
} from "../site-settings.actions";

function makeAdmin(overrides: Record<string, unknown> = {}) {
  return { uid: "user-admin-1", email: "admin@test.com", role: "admin", ...overrides };
}

describe("getSiteSettingsAction — no auth guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSiteSettings.mockResolvedValue({ branding: {}, fees: {} });
  });

  it("no requireRoleUser call", async () => {
    await getSiteSettingsAction();
    expect(mockRequireRoleUser).not.toHaveBeenCalled();
  });

  it("calls getSiteSettings()", async () => {
    await getSiteSettingsAction();
    expect(mockGetSiteSettings).toHaveBeenCalled();
  });

  it("returns { ok: true, data: SiteSettingsDocument }", async () => {
    const result = await getSiteSettingsAction();
    expect(result.ok).toBe(true);
  });

  it("getSiteSettings throws → { ok: false }", async () => {
    mockGetSiteSettings.mockRejectedValue(new Error("DB error"));
    const result = await getSiteSettingsAction();
    expect(result.ok).toBe(false);
  });
});

describe("updateSiteSettingsAction — no wrapAction (throws raw)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockUpdateSiteSettings.mockResolvedValue(undefined);
  });

  it("requireRoleUser called with ['admin'] — plain array, NOT string", async () => {
    await updateSiteSettingsAction({ theme: "dark" });
    expect(mockRequireRoleUser).toHaveBeenCalledWith(["admin"]);
  });

  it("role 'seller' → throws (requireRoleUser rejects)", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(updateSiteSettingsAction({ theme: "dark" })).rejects.toThrow();
  });

  it("role 'moderator' → throws (admin only, not moderator)", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(updateSiteSettingsAction({ theme: "dark" })).rejects.toThrow();
  });

  it("rate limit exceeded (STRICT) → throws", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    await expect(updateSiteSettingsAction({ theme: "dark" })).rejects.toThrow(/too many/i);
  });

  it("rate limit key is site-settings:update:{uid}", async () => {
    await updateSiteSettingsAction({ theme: "dark" });
    expect(mockRateLimitByIdentifier).toHaveBeenCalledWith(
      "site-settings:update:user-admin-1",
      expect.anything(),
    );
  });

  it("data is null → throws ValidationError", async () => {
    await expect(updateSiteSettingsAction(null as any)).rejects.toThrow(/invalid/i);
  });

  it("data is a string (not an object) → throws ValidationError", async () => {
    await expect(updateSiteSettingsAction("not-an-object" as any)).rejects.toThrow();
  });

  it("valid → updateSiteSettings called with (admin.uid, data) — uid is first arg", async () => {
    await updateSiteSettingsAction({ theme: "dark", fees: { platform: 5 } });
    expect(mockUpdateSiteSettings).toHaveBeenCalledWith(
      "user-admin-1",
      { theme: "dark", fees: { platform: 5 } },
    );
  });

  it("returns void on success", async () => {
    const result = await updateSiteSettingsAction({ theme: "dark" });
    expect(result).toBeUndefined();
  });

  it("updateSiteSettings throws → propagates", async () => {
    mockUpdateSiteSettings.mockRejectedValue(new Error("Write failed"));
    await expect(updateSiteSettingsAction({ theme: "dark" })).rejects.toThrow("Write failed");
  });
});
