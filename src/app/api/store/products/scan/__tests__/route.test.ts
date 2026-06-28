/**
 * Tests for GET /api/store/products/scan
 * Looks up a product by barcode. Scoped to seller's own store.
 * Admin: sees any product by barcode.
 * Employee: sees products from their affiliated store only.
 * Seller: sees products from own store only.
 * Product not found → 404. Barcode for other store → 404 (scope leak prevention).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockProductFindByBarcode,
  mockStoreFindByOwner,
  mockUserFindById,
} = vi.hoisted(() => ({
  mockProductFindByBarcode: vi.fn(),
  mockStoreFindByOwner: vi.fn(),
  mockUserFindById: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));
vi.mock("@/constants/api-roles", () => ({ USER_ROLE: { EMPLOYEE: "employee" } }));

vi.mock("@mohasinac/appkit", () => ({
  productRepository: { findByBarcodeId: mockProductFindByBarcode },
  storeRepository: { findByOwnerId: mockStoreFindByOwner },
  userRepository: { findById: mockUserFindById },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
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

import { GET } from "../route";

const makeReq = (barcode?: string) => {
  const url = new URL("http://localhost/api/store/products/scan");
  if (barcode) url.searchParams.set("barcode", barcode);
  return new Request(url.toString());
};

const mockStore = { id: "store-pokemon-palace", ownerId: "seller-uid" };
const mockProduct = { id: "product-charizard", storeId: "store-pokemon-palace", barcodeId: "BC123" };
const mockProductOtherStore = { id: "product-other", storeId: "store-other", barcodeId: "BC456" };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockProductFindByBarcode.mockResolvedValue(mockProduct);
  mockStoreFindByOwner.mockResolvedValue(mockStore);
  mockUserFindById.mockResolvedValue({ uid: "employee-uid", storeId: "store-pokemon-palace" });
});

describe("GET /api/store/products/scan", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq("BC123") as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeReq("BC123") as never);
    expect(res.status).toBe(403);
  });

  it("missing barcode param → 400", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toMatch(/barcode/i);
  });

  it("barcode not found → 404", async () => {
    mockProductFindByBarcode.mockResolvedValue(null);
    const res = await GET(makeReq("NOTFOUND") as never);
    expect(res.status).toBe(404);
  });

  it("seller sees own store's product → 200", async () => {
    const res = await GET(makeReq("BC123") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("product-charizard");
  });

  it("seller scans barcode of other store's product → 404", async () => {
    mockProductFindByBarcode.mockResolvedValue(mockProductOtherStore);
    const res = await GET(makeReq("BC456") as never);
    expect(res.status).toBe(404);
  });

  it("seller has no store → 404", async () => {
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await GET(makeReq("BC123") as never);
    expect(res.status).toBe(404);
  });

  it("admin sees any product regardless of store → 200", async () => {
    _user = { uid: "admin-uid", role: "admin" };
    mockProductFindByBarcode.mockResolvedValue(mockProductOtherStore);
    const res = await GET(makeReq("BC456") as never);
    expect(res.status).toBe(200);
  });

  it("employee sees product from their affiliated store → 200", async () => {
    _user = { uid: "employee-uid", role: "employee" };
    const res = await GET(makeReq("BC123") as never);
    expect(res.status).toBe(200);
  });

  it("employee scans product from different store → 404", async () => {
    _user = { uid: "employee-uid", role: "employee" };
    mockProductFindByBarcode.mockResolvedValue(mockProductOtherStore);
    const res = await GET(makeReq("BC456") as never);
    expect(res.status).toBe(404);
  });

  it("employee with no storeId in profile → 404", async () => {
    _user = { uid: "employee-uid", role: "employee" };
    mockUserFindById.mockResolvedValue({ uid: "employee-uid" }); // no storeId
    const res = await GET(makeReq("BC123") as never);
    expect(res.status).toBe(404);
  });
});
