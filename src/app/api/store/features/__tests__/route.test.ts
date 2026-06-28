/**
 * Tests for GET/POST /api/store/features
 * Both verbs: ROLES_STORE_WRITE + store:api:write.
 * Seller must have a store → 403 if none found.
 *
 * GET:  Returns { items, total, limit: MAX_STORE_CUSTOM_FEATURES, isFull }.
 *       isFull = items.length >= MAX_STORE_CUSTOM_FEATURES.
 *
 * POST: Creates a feature scoped to seller's store.
 *       Injects scope="store" and storeId=store.id.
 *       Cap exceeded → repo throws with CAP error message → 409.
 *       Other create error → 400.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwnerId,
  mockListFiltered,
  mockCreate,
} = vi.hoisted(() => ({
  mockStoreFindByOwnerId: vi.fn(),
  mockListFiltered: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

const MAX_STORE_CUSTOM_FEATURES = 10;
const STORE_CAP_REACHED = "Store feature limit reached";

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwnerId },
  productFeaturesRepository: { listFiltered: mockListFiltered, create: mockCreate },
  MAX_STORE_CUSTOM_FEATURES,
  productFeatureStoreCreateSchema: {
    safeParse: (d: unknown) => {
      const { label, type } = d as Record<string, unknown>;
      if (!label || !type) return { success: false, error: { issues: [{ message: "Required" }] } };
      return { success: true, data: d };
    },
  },
  ERROR_MESSAGES: {
    PRODUCT_FEATURES: {
      NO_STORE: "No store found",
      CREATE_FAILED: "Create failed",
      STORE_CAP_REACHED,
    },
  },
  normalizeError: vi.fn(),
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  ApiErrors: {
    forbidden: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 403 }),
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body });
    };
  },
}));

import { GET, POST } from "../route";

const makeGetReq = () => new Request("http://localhost/api/store/features");
const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/store/features", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockStore = { id: "store-pokemon-palace" };
const mockFeatures = Array.from({ length: 3 }, (_, i) => ({
  id: `feature-${i}`,
  label: `Feature ${i}`,
  type: "badge",
  scope: "store",
  storeId: "store-pokemon-palace",
}));

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwnerId.mockResolvedValue(mockStore);
  mockListFiltered.mockResolvedValue(mockFeatures);
  mockCreate.mockResolvedValue({ id: "feature-new", label: "New Feature", type: "badge" });
});

describe("GET /api/store/features", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("seller with no store → 403", async () => {
    mockStoreFindByOwnerId.mockResolvedValue(null);
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("returns { items, total, limit, isFull }", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as {
      data: { items: unknown[]; total: number; limit: number; isFull: boolean };
    };
    expect(json.data.items).toHaveLength(3);
    expect(json.data.total).toBe(3);
    expect(json.data.limit).toBe(MAX_STORE_CUSTOM_FEATURES);
    expect(json.data.isFull).toBe(false);
  });

  it("items at capacity → isFull=true", async () => {
    const full = Array.from({ length: MAX_STORE_CUSTOM_FEATURES }, (_, i) => ({
      id: `feature-${i}`,
    }));
    mockListFiltered.mockResolvedValue(full);
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { isFull: boolean } };
    expect(json.data.isFull).toBe(true);
  });

  it("listFiltered called with scope=store and storeId", async () => {
    await GET(makeGetReq() as never);
    expect(mockListFiltered).toHaveBeenCalledWith({
      scope: "store",
      storeId: "store-pokemon-palace",
    });
  });
});

describe("POST /api/store/features", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq({ label: "New", type: "badge" }) as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await POST(makePostReq({ label: "New", type: "badge" }) as never);
    expect(res.status).toBe(403);
  });

  it("seller with no store → 403", async () => {
    mockStoreFindByOwnerId.mockResolvedValue(null);
    const res = await POST(makePostReq({ label: "New", type: "badge" }) as never);
    expect(res.status).toBe(403);
  });

  it("missing label → 400 (schema validation)", async () => {
    const res = await POST(makePostReq({ type: "badge" }) as never);
    expect(res.status).toBe(400);
  });

  it("injects scope=store and storeId on create", async () => {
    await POST(makePostReq({ label: "Free Ship", type: "badge" }) as never);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "store", storeId: "store-pokemon-palace" }),
    );
  });

  it("success → 201 with created feature", async () => {
    const res = await POST(makePostReq({ label: "New Feature", type: "badge" }) as never);
    expect(res.status).toBe(201);
  });

  it("cap exceeded → repo throws with CAP message → 409", async () => {
    mockCreate.mockRejectedValue(new Error(STORE_CAP_REACHED));
    const res = await POST(makePostReq({ label: "Over Limit", type: "badge" }) as never);
    expect(res.status).toBe(409);
  });

  it("other create error → 400", async () => {
    mockCreate.mockRejectedValue(new Error("Unknown error"));
    const res = await POST(makePostReq({ label: "Bad", type: "badge" }) as never);
    expect(res.status).toBe(400);
  });
});
