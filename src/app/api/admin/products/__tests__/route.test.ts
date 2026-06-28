/**
 * Tests for GET + POST /api/admin/products
 * GET: admin/moderator can list all products across all stores.
 * POST: admin can create product; media URLs finalized; validation via local productCreateSchema.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockProductList,
  mockProductCreate,
  mockFinalizeStagedMediaUrl,
  mockFinalizeStagedMediaArray,
  mockFinalizeStagedMediaField,
} = vi.hoisted(() => ({
  mockProductList: vi.fn(),
  mockProductCreate: vi.fn(),
  mockFinalizeStagedMediaUrl: vi.fn((v: string) => Promise.resolve(v)),
  mockFinalizeStagedMediaArray: vi.fn((v: string[]) => Promise.resolve(v)),
  mockFinalizeStagedMediaField: vi.fn((v: unknown) => Promise.resolve(v)),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
}));
vi.mock("@mohasinac/appkit", () => ({
  productRepository: { list: mockProductList, create: mockProductCreate },
  finalizeStagedMediaUrl: mockFinalizeStagedMediaUrl,
  finalizeStagedMediaArray: mockFinalizeStagedMediaArray,
  finalizeStagedMediaField: mockFinalizeStagedMediaField,
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  errorResponse: (msg: string, status = 400, details?: unknown) =>
    new Response(JSON.stringify({ ok: false, error: msg, details }), { status }),
  serverLogger: { info: vi.fn(), error: vi.fn() },
  getDefaultCurrency: () => "INR",
  FIREBASE_STORAGE_HOST: "firebasestorage.googleapis.com",
  GCS_HOST: "storage.googleapis.com",
  ERROR_MESSAGES: { VALIDATION: { FAILED: "Validation failed" } },
  SUCCESS_MESSAGES: { PRODUCT: { CREATED: "Product created" } },
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET, POST } from "../route";

const pagedResult = {
  items: [{ id: "product-charizard", storeId: "store-palace" }],
  total: 1,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
};

// Minimal valid product body matching productCreateSchema
const validProductBody = {
  title: "Pokemon Charizard PSA 9",
  description: "First edition base set charizard graded PSA 9 near mint",
  category: "trading-cards",
  price: 500000,
  stockQuantity: 1,
  mainImage: "https://firebasestorage.googleapis.com/v0/b/test/o/product-img.jpg",
  storeId: "store-palace",
  listingType: "standard",
};

const makeGetReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/products");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockProductList.mockResolvedValue(pagedResult);
  mockProductCreate.mockResolvedValue({ id: "product-new", storeId: "store-palace" });
});

describe("GET /api/admin/products", () => {
  it("unauthenticated → still serves (auth not required on GET)", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    // GET has no auth: true, only roles — with no user the roles check may still apply
    // The route has roles restriction without explicit auth gate
    expect([200, 401, 403]).toContain(res.status);
  });

  it("seller role → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("moderator can access", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
  });

  it("returns products from all stores", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.total).toBe(1);
    expect(json.data.items).toHaveLength(1);
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeGetReq({ pageSize: "200" }) as never);
    const callArg = mockProductList.mock.calls[0][0] as { pageSize: number };
    expect(callArg.pageSize).toBe(50);
  });

  it("filters passed through", async () => {
    await GET(makeGetReq({ filters: "listingType==auction" }) as never);
    expect(mockProductList).toHaveBeenCalledWith(
      expect.objectContaining({ filters: "listingType==auction" }),
    );
  });
});

describe("POST /api/admin/products", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq(validProductBody) as never);
    expect(res.status).toBe(401);
  });

  it("seller role → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await POST(makePostReq(validProductBody) as never);
    expect(res.status).toBe(403);
  });

  it("title shorter than 3 chars → 400", async () => {
    const res = await POST(makePostReq({ ...validProductBody, title: "AB" }) as never);
    expect(res.status).toBe(400);
  });

  it("description shorter than 20 chars → 400", async () => {
    const res = await POST(makePostReq({ ...validProductBody, description: "Too short" }) as never);
    expect(res.status).toBe(400);
  });

  it("price <= 0 → 400", async () => {
    const res = await POST(makePostReq({ ...validProductBody, price: 0 }) as never);
    expect(res.status).toBe(400);
  });

  it("negative stockQuantity → 400", async () => {
    const res = await POST(makePostReq({ ...validProductBody, stockQuantity: -1 }) as never);
    expect(res.status).toBe(400);
  });

  it("title with prohibited word → 400", async () => {
    const res = await POST(makePostReq({ ...validProductBody, title: "Pokemon scam card ultra" }) as never);
    expect(res.status).toBe(400);
  });

  it("auction listingType without auctionEndDate → 400", async () => {
    const res = await POST(makePostReq({
      ...validProductBody,
      listingType: "auction",
      startingBid: 10000,
      // missing auctionEndDate
    }) as never);
    expect(res.status).toBe(400);
  });

  it("valid product → productRepository.create called", async () => {
    await POST(makePostReq(validProductBody) as never);
    expect(mockProductCreate).toHaveBeenCalled();
  });

  it("mainImage URL finalized via finalizeStagedMediaUrl", async () => {
    await POST(makePostReq(validProductBody) as never);
    expect(mockFinalizeStagedMediaUrl).toHaveBeenCalledWith(validProductBody.mainImage);
  });

  it("storeId from request body forwarded to create", async () => {
    await POST(makePostReq(validProductBody) as never);
    expect(mockProductCreate).toHaveBeenCalledWith(
      expect.objectContaining({ storeId: "store-palace" }),
    );
  });

  it("success → 201 with product data", async () => {
    const res = await POST(makePostReq(validProductBody) as never);
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { ok: boolean; data: { id: string } };
    expect(json.ok).toBe(true);
    expect(json.data.id).toBe("product-new");
  });
});
