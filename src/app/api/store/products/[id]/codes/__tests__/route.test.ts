/**
 * Tests for POST /api/store/products/[id]/codes
 * ROLES_STORE_WRITE + store:api:write
 *
 * Ingests up to 200 digital codes per request into products/{id}/codes subcollection.
 * Atomically updates digitalCode.codePoolSize and digitalCode.codesAvailable.
 *
 * Guards:
 * - Product must exist → 404
 * - Product must be listingType="digital-code" → 400
 * - Seller must own the product's store → 403 (admin bypasses)
 * - codes array: min 1, max 200, each string 1-256 chars → 400 on violation
 *
 * On success:
 * - inserted = codes.length
 * - codesAvailable = previous codesAvailable + inserted
 * - codePoolSize = previous codePoolSize + inserted
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockProductFindById,
  mockStoreFindByOwnerId,
  mockBatchSet,
  mockBatchUpdate,
  mockBatchCommit,
  mockGetAdminDb,
} = vi.hoisted(() => ({
  mockProductFindById: vi.fn(),
  mockStoreFindByOwnerId: vi.fn(),
  mockBatchSet: vi.fn(),
  mockBatchUpdate: vi.fn(),
  mockBatchCommit: vi.fn(),
  mockGetAdminDb: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit/server", () => ({ getAdminDb: mockGetAdminDb }));

vi.mock("@mohasinac/appkit", () => ({
  productRepository: { findById: mockProductFindById },
  storeRepository: { findByOwnerId: mockStoreFindByOwnerId },
  PRODUCT_COLLECTION: "products",
  PRODUCT_CODES_SUBCOLLECTION: "codes",
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  ApiErrors: {
    forbidden: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 403 }),
    notFound: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
    badRequest: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 }),
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; request: Request; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request, params });
    };
  },
}));

import { POST } from "../route";

const params = { params: { id: "product-steam-cyberpunk" } };

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/store/products/product-steam-cyberpunk/codes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockProduct = {
  id: "product-steam-cyberpunk",
  listingType: "digital-code",
  storeId: "store-diecast-depot",
  digitalCode: { codePoolSize: 5, codesAvailable: 3 },
};

// Mock the Firestore batch and collection chain
const mockDoc = { id: "new-code-doc-id" };
const mockCodesCollRef = { doc: vi.fn(() => mockDoc) };
const mockProductRef = {};
const mockCollection = vi.fn((name: string) => {
  if (name === "products") return { doc: vi.fn(() => ({ collection: vi.fn(() => mockCodesCollRef), ...mockProductRef })) };
  return {};
});
const mockBatch = {
  set: mockBatchSet,
  update: mockBatchUpdate,
  commit: mockBatchCommit,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockProductFindById.mockResolvedValue(mockProduct);
  mockStoreFindByOwnerId.mockResolvedValue({ id: "store-diecast-depot" });
  mockBatchCommit.mockResolvedValue(undefined);
  mockCodesCollRef.doc.mockReturnValue(mockDoc);

  const mockDb = {
    collection: mockCollection,
    batch: vi.fn(() => mockBatch),
  };
  mockGetAdminDb.mockReturnValue(mockDb);
});

describe("POST /api/store/products/[id]/codes", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeRequest({ codes: ["CODE1"] }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await POST(makeRequest({ codes: ["CODE1"] }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("invalid JSON body → 400", async () => {
    const badReq = new Request("http://localhost/api/store/products/product-steam-cyberpunk/codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(badReq as never, params as never);
    expect(res.status).toBe(400);
  });

  it("missing codes field → 400", async () => {
    const res = await POST(makeRequest({}) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("empty codes array → 400 (min 1)", async () => {
    const res = await POST(makeRequest({ codes: [] }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("codes array exceeds 200 → 400 (max 200)", async () => {
    const tooMany = Array.from({ length: 201 }, (_, i) => `CODE${i}`);
    const res = await POST(makeRequest({ codes: tooMany }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("codes array at exactly 200 → allowed", async () => {
    const exactly200 = Array.from({ length: 200 }, (_, i) => `CODE${i}`);
    const res = await POST(makeRequest({ codes: exactly200 }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("product not found → 404", async () => {
    mockProductFindById.mockResolvedValue(null);
    const res = await POST(makeRequest({ codes: ["CODE1"] }) as never, params as never);
    expect(res.status).toBe(404);
  });

  it("product not digital-code listing type → 400", async () => {
    mockProductFindById.mockResolvedValue({ ...mockProduct, listingType: "standard" });
    const res = await POST(makeRequest({ codes: ["CODE1"] }) as never, params as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("digital-code");
  });

  it("seller's store doesn't match product.storeId → 403", async () => {
    mockStoreFindByOwnerId.mockResolvedValue({ id: "store-other" });
    const res = await POST(makeRequest({ codes: ["CODE1"] }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("admin bypasses store scope check", async () => {
    _user = { uid: "admin-uid", role: "admin" };
    mockStoreFindByOwnerId.mockResolvedValue(null); // admin has no store
    const res = await POST(makeRequest({ codes: ["CODE1"] }) as never, params as never);
    expect(res.status).toBe(200);
    // store findByOwnerId not called for admin
    expect(mockStoreFindByOwnerId).not.toHaveBeenCalled();
  });

  it("commits batch with code documents and updated pool sizes", async () => {
    await POST(makeRequest({ codes: ["CODE1", "CODE2"] }) as never, params as never);
    expect(mockBatchCommit).toHaveBeenCalledOnce();
    expect(mockBatchSet).toHaveBeenCalledTimes(2);
    expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
  });

  it("returns { inserted, codesAvailable } based on previous counts + new codes", async () => {
    const res = await POST(makeRequest({ codes: ["CODE1", "CODE2"] }) as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { inserted: number; codesAvailable: number } };
    expect(json.data.inserted).toBe(2);
    // previous codesAvailable=3 + 2 new = 5
    expect(json.data.codesAvailable).toBe(5);
  });

  it("product with no existing digitalCode → defaults prevAvailable=0, prevPoolSize=0", async () => {
    mockProductFindById.mockResolvedValue({ ...mockProduct, digitalCode: undefined });
    const res = await POST(makeRequest({ codes: ["CODE1"] }) as never, params as never);
    const json = await res.clone().json() as { data: { codesAvailable: number } };
    expect(json.data.codesAvailable).toBe(1);
  });
});
