/**
 * Tests for GET / PATCH /api/admin/stores/[uid]
 *
 * GET: ROLES_ADMIN_MOD — storeRepository.findById(uid) → 404 if null
 * PATCH: ROLES_ADMIN_MOD — findById check → storeRepository.update(uid, filteredFields)
 *
 * IMPORTANT: Both GET and PATCH are ROLES_ADMIN_MOD (not ADMIN_ONLY).
 * PATCH fields: storeStatus → mapped to "status", adminNotes, isFeatured, isVerified,
 *               suspensionReason, capabilities. Empty body → no update call.
 *
 * BUSINESS NOTE: The route uses the [uid] param as the storeId (not ownerUid).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindById,
  mockStoreUpdate,
} = vi.hoisted(() => ({
  mockStoreFindById: vi.fn(),
  mockStoreUpdate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  STORE_FIELDS: {
    STATUS_VALUES: { ACTIVE: "active", PENDING: "pending", SUSPENDED: "suspended", INACTIVE: "inactive" },
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findById: mockStoreFindById, update: mockStoreUpdate },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
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
      return opts.handler({ user: _user ?? undefined, body, params });
    };
  },
}));

import { GET, PATCH } from "../route";

const params = { params: Promise.resolve({ uid: "store-pokemon-palace" }) };

const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/admin/stores/store-pokemon-palace", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const mockStore = {
  id: "store-pokemon-palace",
  storeName: "Pokémon Palace",
  status: "active",
  isVerified: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockStoreFindById.mockResolvedValue(mockStore);
  mockStoreUpdate.mockResolvedValue(undefined);
});

describe("GET /api/admin/stores/[uid]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("store not found → 404", async () => {
    mockStoreFindById.mockResolvedValue(null);
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("found store → 200 with full store data", async () => {
    const res = await GET(makeRequest("GET") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: typeof mockStore };
    expect(json.data.id).toBe("store-pokemon-palace");
    expect(json.data.storeName).toBe("Pokémon Palace");
  });

  it("fetches by uid param as storeId", async () => {
    await GET(makeRequest("GET") as never, params as never);
    expect(mockStoreFindById).toHaveBeenCalledWith("store-pokemon-palace");
  });
});

describe("PATCH /api/admin/stores/[uid]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest("PATCH", { isVerified: true }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PATCH(makeRequest("PATCH", { isVerified: true }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD — not admin only)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeRequest("PATCH", { isVerified: true }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("invalid storeStatus value → 400", async () => {
    const res = await PATCH(makeRequest("PATCH", { storeStatus: "INVALID" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("store not found → 404", async () => {
    mockStoreFindById.mockResolvedValue(null);
    const res = await PATCH(makeRequest("PATCH", { isVerified: true }) as never, params as never);
    expect(res.status).toBe(404);
  });

  it("storeStatus mapped to 'status' field in update", async () => {
    await PATCH(makeRequest("PATCH", { storeStatus: "suspended" }) as never, params as never);
    expect(mockStoreUpdate).toHaveBeenCalledWith(
      "store-pokemon-palace",
      expect.objectContaining({ status: "suspended" }),
    );
  });

  it("all valid storeStatus values accepted: active, pending, suspended, inactive", async () => {
    for (const storeStatus of ["active", "pending", "suspended", "inactive"]) {
      const res = await PATCH(makeRequest("PATCH", { storeStatus }) as never, params as never);
      expect(res.status).toBe(200);
    }
  });

  it("isVerified: false → update called", async () => {
    await PATCH(makeRequest("PATCH", { isVerified: false }) as never, params as never);
    expect(mockStoreUpdate).toHaveBeenCalledWith(
      "store-pokemon-palace",
      expect.objectContaining({ isVerified: false }),
    );
  });

  it("empty body (no fields) → storeRepository.update NOT called", async () => {
    await PATCH(makeRequest("PATCH", {}) as never, params as never);
    expect(mockStoreUpdate).not.toHaveBeenCalled();
  });

  it("success → 200 with { storeId, ...body }", async () => {
    const res = await PATCH(makeRequest("PATCH", { adminNotes: "Verified by admin", isFeatured: true }) as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { storeId: string; adminNotes: string; isFeatured: boolean } };
    expect(json.data.storeId).toBe("store-pokemon-palace");
    expect(json.data.adminNotes).toBe("Verified by admin");
    expect(json.data.isFeatured).toBe(true);
  });
});
