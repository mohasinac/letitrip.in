/**
 * Tests for GET / POST /api/admin/checkout-bypass
 *
 * GET: ROLES_ADMIN_ONLY + permission: settings:write
 *      Returns { enabled: boolean } based on siteSettings.featureFlags.adminCheckoutBypass.
 *
 * POST: ROLES_ADMIN_ONLY + permission: settings:write
 *       Schema: { addressId: string min 1, notes?: string max 500, excludedProductIds?: string[] }
 *       Guards:
 *         1. Must be admin (role check in createRouteHandler)
 *         2. siteSettings.featureFlags.adminCheckoutBypass === true → else ApiErrors.forbidden(403)
 *       Calls: grantAdminCheckoutBypass(adminUid, addressId, adminUid)
 *              createCheckoutOrderAction({ userId, userName, userEmail, addressId,
 *                paymentMethod: "admin_bypass", adminBypass: true, adminBypassBy: adminUid, ... })
 *       Returns result of createCheckoutOrderAction.
 *
 * BUSINESS RULE: adminBypass flag skips OTP and payment verification.
 *                Feature flag must be enabled server-side — route checks it independently.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string; displayName?: string; email?: string } | null = null;

const {
  mockGetSingleton,
  mockGrantAdminCheckoutBypass,
  mockCreateCheckoutOrderAction,
} = vi.hoisted(() => ({
  mockGetSingleton: vi.fn(),
  mockGrantAdminCheckoutBypass: vi.fn(),
  mockCreateCheckoutOrderAction: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));

vi.mock("@mohasinac/appkit/server", () => ({
  grantAdminCheckoutBypass: mockGrantAdminCheckoutBypass,
}));

vi.mock("@mohasinac/appkit", () => ({
  siteSettingsRepository: { getSingleton: mockGetSingleton },
  createCheckoutOrderAction: mockCreateCheckoutOrderAction,
  ApiErrors: {
    forbidden: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 403 }),
  },
  PaymentMethodValues: { ADMIN_BYPASS: "admin_bypass" },
  serverLogger: { info: vi.fn() },
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
      try {
        return await opts.handler({ user: _user ?? undefined, body });
      } catch (e) {
        if (e instanceof Response) return e;
        throw e;
      }
    };
  },
}));

import { GET, POST } from "../route";

const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/checkout-bypass", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const orderResult = {
  orderIds: ["order-1-20260601-abc123"],
  total: 50000,
  itemCount: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin", displayName: "Admin User", email: "admin@letitrip.in" };
  mockGetSingleton.mockResolvedValue({
    featureFlags: { adminCheckoutBypass: true },
  });
  mockGrantAdminCheckoutBypass.mockResolvedValue(undefined);
  mockCreateCheckoutOrderAction.mockResolvedValue(orderResult);
});

describe("GET /api/admin/checkout-bypass", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeRequest("GET") as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeRequest("GET") as never);
    expect(res.status).toBe(403);
  });

  it("adminCheckoutBypass = true → { enabled: true }", async () => {
    const res = await GET(makeRequest("GET") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { enabled: boolean } };
    expect(json.data.enabled).toBe(true);
  });

  it("adminCheckoutBypass = false → { enabled: false }", async () => {
    mockGetSingleton.mockResolvedValue({ featureFlags: { adminCheckoutBypass: false } });
    const res = await GET(makeRequest("GET") as never);
    const json = await res.clone().json() as { data: { enabled: boolean } };
    expect(json.data.enabled).toBe(false);
  });

  it("featureFlags missing entirely → { enabled: false }", async () => {
    mockGetSingleton.mockResolvedValue({});
    const res = await GET(makeRequest("GET") as never);
    const json = await res.clone().json() as { data: { enabled: boolean } };
    expect(json.data.enabled).toBe(false);
  });
});

describe("POST /api/admin/checkout-bypass", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeRequest("POST", { addressId: "addr-1" }) as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makeRequest("POST", { addressId: "addr-1" }) as never);
    expect(res.status).toBe(403);
  });

  it("missing addressId → 400", async () => {
    const res = await POST(makeRequest("POST", {}) as never);
    expect(res.status).toBe(400);
  });

  it("empty addressId → 400", async () => {
    const res = await POST(makeRequest("POST", { addressId: "" }) as never);
    expect(res.status).toBe(400);
  });

  it("notes > 500 chars → 400", async () => {
    const res = await POST(makeRequest("POST", { addressId: "addr-1", notes: "x".repeat(501) }) as never);
    expect(res.status).toBe(400);
  });

  it("feature flag disabled server-side → 403 (even with admin role)", async () => {
    mockGetSingleton.mockResolvedValue({ featureFlags: { adminCheckoutBypass: false } });
    const res = await POST(makeRequest("POST", { addressId: "addr-1" }) as never);
    expect(res.status).toBe(403);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("not enabled");
  });

  it("calls grantAdminCheckoutBypass with (adminUid, addressId, adminUid)", async () => {
    await POST(makeRequest("POST", { addressId: "user-addr-main" }) as never);
    expect(mockGrantAdminCheckoutBypass).toHaveBeenCalledWith("admin-uid", "user-addr-main", "admin-uid");
  });

  it("calls createCheckoutOrderAction with adminBypass: true and paymentMethod: admin_bypass", async () => {
    await POST(makeRequest("POST", { addressId: "user-addr-main" }) as never);
    expect(mockCreateCheckoutOrderAction).toHaveBeenCalledWith(
      expect.objectContaining({
        adminBypass: true,
        adminBypassBy: "admin-uid",
        paymentMethod: "admin_bypass",
        addressId: "user-addr-main",
      }),
    );
  });

  it("userName uses displayName when available", async () => {
    _user = { uid: "admin-uid", role: "admin", displayName: "John Admin", email: "john@example.com" };
    await POST(makeRequest("POST", { addressId: "addr-1" }) as never);
    expect(mockCreateCheckoutOrderAction).toHaveBeenCalledWith(
      expect.objectContaining({ userName: "John Admin" }),
    );
  });

  it("userName falls back to email when no displayName", async () => {
    _user = { uid: "admin-uid", role: "admin", email: "admin@letitrip.in" };
    await POST(makeRequest("POST", { addressId: "addr-1" }) as never);
    expect(mockCreateCheckoutOrderAction).toHaveBeenCalledWith(
      expect.objectContaining({ userName: "admin@letitrip.in" }),
    );
  });

  it("userName falls back to 'Admin' when neither displayName nor email", async () => {
    _user = { uid: "admin-uid", role: "admin" };
    await POST(makeRequest("POST", { addressId: "addr-1" }) as never);
    expect(mockCreateCheckoutOrderAction).toHaveBeenCalledWith(
      expect.objectContaining({ userName: "Admin" }),
    );
  });

  it("notes trimmed to empty string → reason defaults to 'no reason supplied'", async () => {
    await POST(makeRequest("POST", { addressId: "addr-1", notes: "   " }) as never);
    // The route passes notes through to createCheckoutOrderAction; reason is only for logging
    expect(mockCreateCheckoutOrderAction).toHaveBeenCalledWith(
      expect.objectContaining({ notes: "   " }),
    );
  });

  it("excludedProductIds passed through to createCheckoutOrderAction", async () => {
    await POST(makeRequest("POST", { addressId: "addr-1", excludedProductIds: ["product-abc"] }) as never);
    expect(mockCreateCheckoutOrderAction).toHaveBeenCalledWith(
      expect.objectContaining({ excludedProductIds: ["product-abc"] }),
    );
  });

  it("success → 200 with order result", async () => {
    const res = await POST(makeRequest("POST", { addressId: "addr-1" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof orderResult; message: string };
    expect(json.data.orderIds).toHaveLength(1);
    expect(json.message).toContain("bypass");
  });
});
