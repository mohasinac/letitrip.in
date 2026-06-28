/**
 * Tests for POST /api/store/products/[id]/duplicate
 * Creates a copy of the listing with status="draft" and "(copy)" appended to title.
 * Resets stats fields: viewCount, purchaseCount, favoriteCount, avgRating.
 * Source not found → 404. No store → 403. Not your listing → 403.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockProductFindById,
  mockProductCreate,
  mockStoreFindByOwner,
  mockNormalizeError,
} = vi.hoisted(() => ({
  mockProductFindById: vi.fn(),
  mockProductCreate: vi.fn(),
  mockStoreFindByOwner: vi.fn(),
  mockNormalizeError: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  productRepository: { findById: mockProductFindById, create: mockProductCreate },
  storeRepository: { findByOwnerId: mockStoreFindByOwner },
  normalizeError: mockNormalizeError,
  successResponse: (data: unknown, _msg?: string, _status?: number) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 201 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  ApiErrors: {
    notFound: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
    forbidden: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 403 }),
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: undefined }) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, params });
    };
  },
}));

import { POST } from "../route";

const mockProduct = {
  id: "product-charizard",
  storeId: "store-pokemon-palace",
  title: "Charizard PSA 9",
  status: "published",
  viewCount: 150,
  purchaseCount: 12,
  favoriteCount: 30,
  avgRating: 4.8,
};

const mockStore = { id: "store-pokemon-palace", ownerId: "seller-uid" };
const mockCreated = { ...mockProduct, id: "product-charizard-copy" };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockProductFindById.mockResolvedValue(mockProduct);
  mockStoreFindByOwner.mockResolvedValue(mockStore);
  mockProductCreate.mockResolvedValue(mockCreated);
});

describe("POST /api/store/products/[id]/duplicate", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST({} as never, { params: { id: "product-charizard" } } as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await POST({} as never, { params: { id: "product-charizard" } } as never);
    expect(res.status).toBe(403);
  });

  it("source product not found → 404", async () => {
    mockProductFindById.mockResolvedValue(null);
    const res = await POST({} as never, { params: { id: "product-missing" } } as never);
    expect(res.status).toBe(404);
  });

  it("no store → 403", async () => {
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await POST({} as never, { params: { id: "product-charizard" } } as never);
    expect(res.status).toBe(403);
  });

  it("product belongs to different store → 403", async () => {
    mockProductFindById.mockResolvedValue({ ...mockProduct, storeId: "store-other" });
    const res = await POST({} as never, { params: { id: "product-charizard" } } as never);
    expect(res.status).toBe(403);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toMatch(/not your/i);
  });

  it("copy has status=draft", async () => {
    await POST({} as never, { params: { id: "product-charizard" } } as never);
    const createArg = mockProductCreate.mock.calls[0][0] as { status: string };
    expect(createArg.status).toBe("draft");
  });

  it("copy title has '(copy)' appended", async () => {
    await POST({} as never, { params: { id: "product-charizard" } } as never);
    const createArg = mockProductCreate.mock.calls[0][0] as { title: string };
    expect(createArg.title).toBe("Charizard PSA 9 (copy)");
  });

  it("stats fields reset to zero", async () => {
    await POST({} as never, { params: { id: "product-charizard" } } as never);
    const createArg = mockProductCreate.mock.calls[0][0] as {
      viewCount: number;
      purchaseCount: number;
      favoriteCount: number;
      avgRating: number;
    };
    expect(createArg.viewCount).toBe(0);
    expect(createArg.purchaseCount).toBe(0);
    expect(createArg.favoriteCount).toBe(0);
    expect(createArg.avgRating).toBe(0);
  });

  it("copy does not have id from source (new document)", async () => {
    await POST({} as never, { params: { id: "product-charizard" } } as never);
    const createArg = mockProductCreate.mock.calls[0][0] as { id?: string };
    expect(createArg.id).toBeUndefined();
  });

  it("success → 201 with created product", async () => {
    const res = await POST({} as never, { params: { id: "product-charizard" } } as never);
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("product-charizard-copy");
  });
});
