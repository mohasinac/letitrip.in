/**
 * Tests for GET / PUT /api/admin/feature-flags
 *
 * GET: ROLES_ADMIN_MOD — siteSettingsRepository.getSingleton()
 *      → returns { flags: settings.featureFlags, rollouts: settings.featureFlagRollouts }
 *      Defaults to {} when fields missing.
 *
 * PUT: ROLES_ADMIN_ONLY — featureFlagsSchema: { flags?: Record<string, boolean>, rollouts?: Record<string, number 0-100> }
 *      → siteSettingsRepository.updateSingleton({ featureFlags: body.flags, featureFlagRollouts: body.rollouts })
 *
 * BUSINESS RULE: rollout percentages must be 0-100 (Zod min/max enforced).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockGetSingleton,
  mockUpdateSingleton,
} = vi.hoisted(() => ({
  mockGetSingleton: vi.fn(),
  mockUpdateSingleton: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  siteSettingsRepository: {
    getSingleton: mockGetSingleton,
    updateSingleton: mockUpdateSingleton,
  },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown } };
    handler: (ctx: { user?: unknown; body?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = {}; }
      if (opts.schema) {
        const result = opts.schema.safeParse(body);
        if (!result.success) return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body });
    };
  },
}));

import { GET, PUT } from "../route";

const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/feature-flags", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockGetSingleton.mockResolvedValue({
    featureFlags: { newCheckout: true, betaDashboard: false },
    featureFlagRollouts: { newSearch: 50 },
  });
  mockUpdateSingleton.mockResolvedValue(undefined);
});

describe("GET /api/admin/feature-flags", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeRequest("GET") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeRequest("GET") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (allowed in ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeRequest("GET") as never);
    expect(res.status).toBe(200);
  });

  it("returns { flags, rollouts } from siteSettings", async () => {
    const res = await GET(makeRequest("GET") as never);
    const json = await res.clone().json() as { data: { flags: Record<string, boolean>; rollouts: Record<string, number> } };
    expect(json.data.flags.newCheckout).toBe(true);
    expect(json.data.flags.betaDashboard).toBe(false);
    expect(json.data.rollouts.newSearch).toBe(50);
  });

  it("missing featureFlags field → defaults to {}", async () => {
    mockGetSingleton.mockResolvedValue({});
    const res = await GET(makeRequest("GET") as never);
    const json = await res.clone().json() as { data: { flags: Record<string, boolean> } };
    expect(json.data.flags).toEqual({});
  });

  it("missing featureFlagRollouts field → defaults to {}", async () => {
    mockGetSingleton.mockResolvedValue({ featureFlags: { x: true } });
    const res = await GET(makeRequest("GET") as never);
    const json = await res.clone().json() as { data: { rollouts: Record<string, number> } };
    expect(json.data.rollouts).toEqual({});
  });
});

describe("PUT /api/admin/feature-flags", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PUT(makeRequest("PUT", { flags: { x: true } }) as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PUT(makeRequest("PUT", { flags: { x: true } }) as never);
    expect(res.status).toBe(403);
  });

  it("rollout value > 100 → 400", async () => {
    const res = await PUT(makeRequest("PUT", { rollouts: { feature: 101 } }) as never);
    expect(res.status).toBe(400);
  });

  it("rollout value < 0 → 400", async () => {
    const res = await PUT(makeRequest("PUT", { rollouts: { feature: -1 } }) as never);
    expect(res.status).toBe(400);
  });

  it("flags values must be booleans → 400 for non-boolean", async () => {
    const res = await PUT(makeRequest("PUT", { flags: { feature: "yes" } }) as never);
    expect(res.status).toBe(400);
  });

  it("empty body (no flags or rollouts) → allowed (both optional)", async () => {
    const res = await PUT(makeRequest("PUT", {}) as never);
    expect(res.status).toBe(200);
  });

  it("calls updateSingleton with featureFlags and featureFlagRollouts", async () => {
    await PUT(makeRequest("PUT", { flags: { newCheckout: false }, rollouts: { newSearch: 75 } }) as never);
    expect(mockUpdateSingleton).toHaveBeenCalledWith(
      expect.objectContaining({
        featureFlags: { newCheckout: false },
        featureFlagRollouts: { newSearch: 75 },
      }),
    );
  });

  it("success → 200 with null data", async () => {
    const res = await PUT(makeRequest("PUT", { flags: { test: true } }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toContain("updated");
  });

  it("rollout exactly 0 and 100 → boundary values accepted", async () => {
    const res = await PUT(makeRequest("PUT", { rollouts: { a: 0, b: 100 } }) as never);
    expect(res.status).toBe(200);
  });
});
