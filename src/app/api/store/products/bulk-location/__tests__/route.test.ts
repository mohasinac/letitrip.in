/**
 * Tests for PATCH /api/store/products/bulk-location
 * ROLES_STORE_WRITE + store:api:write
 * Uses createApiHandler (not createRouteHandler).
 *
 * Updates physicalLocation (zone, shelf, bin) for multiple products atomically.
 * Guards:
 * - Seller must have a store → 403
 * - productIds must be a non-empty array → 400
 * - productIds.length > 50 → 400 (BULK_MAX)
 * - physicalLocation must have zone, shelf, bin as strings → 400
 * - ALL products must belong to seller's store — verified before any write
 *   → if any product is missing or from different store → 403 for the whole batch
 * - Calls productRepository.update(id, { physicalLocation }) for each product in parallel
 * - Returns { updated: productIds.length }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwnerId,
  mockProductFindById,
  mockProductUpdate,
} = vi.hoisted(() => ({
  mockStoreFindByOwnerId: vi.fn(),
  mockProductFindById: vi.fn(),
  mockProductUpdate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwnerId },
  productRepository: {
    findById: mockProductFindById,
    update: mockProductUpdate,
  },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  ApiErrors: {
    forbidden: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 403 }),
    badRequest: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 }),
  },
  createApiHandler: (opts: {
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (!_user) return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user, request });
    };
  },
}));

import { PATCH } from "../route";

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/store/products/bulk-location", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validLocation = { zone: "A", shelf: "2", bin: "03" };
const productIds = ["product-hw-1", "product-hw-2", "product-hw-3"];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwnerId.mockResolvedValue({ id: "store-diecast-depot" });
  mockProductFindById.mockResolvedValue({ id: "product-hw-1", storeId: "store-diecast-depot" });
  mockProductUpdate.mockResolvedValue(undefined);
});

describe("PATCH /api/store/products/bulk-location", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest({ productIds, physicalLocation: validLocation }) as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await PATCH(makeRequest({ productIds, physicalLocation: validLocation }) as never);
    expect(res.status).toBe(403);
  });

  it("seller with no store → 403", async () => {
    mockStoreFindByOwnerId.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ productIds, physicalLocation: validLocation }) as never);
    expect(res.status).toBe(403);
  });

  it("missing productIds → 400", async () => {
    const res = await PATCH(makeRequest({ physicalLocation: validLocation }) as never);
    expect(res.status).toBe(400);
  });

  it("empty productIds array → 400", async () => {
    const res = await PATCH(makeRequest({ productIds: [], physicalLocation: validLocation }) as never);
    expect(res.status).toBe(400);
  });

  it("productIds not an array → 400", async () => {
    const res = await PATCH(makeRequest({ productIds: "product-1", physicalLocation: validLocation }) as never);
    expect(res.status).toBe(400);
  });

  it("productIds.length > 50 → 400", async () => {
    const tooMany = Array.from({ length: 51 }, (_, i) => `product-${i}`);
    const res = await PATCH(makeRequest({ productIds: tooMany, physicalLocation: validLocation }) as never);
    expect(res.status).toBe(400);
  });

  it("productIds.length = 50 → allowed", async () => {
    const exactly50 = Array.from({ length: 50 }, (_, i) => `product-${i}`);
    mockProductFindById.mockResolvedValue({ id: "product-0", storeId: "store-diecast-depot" });
    const res = await PATCH(makeRequest({ productIds: exactly50, physicalLocation: validLocation }) as never);
    expect(res.status).toBe(200);
  });

  it("missing physicalLocation → 400", async () => {
    const res = await PATCH(makeRequest({ productIds }) as never);
    expect(res.status).toBe(400);
  });

  it("physicalLocation missing zone → 400", async () => {
    const res = await PATCH(makeRequest({ productIds, physicalLocation: { shelf: "2", bin: "03" } }) as never);
    expect(res.status).toBe(400);
  });

  it("physicalLocation missing shelf → 400", async () => {
    const res = await PATCH(makeRequest({ productIds, physicalLocation: { zone: "A", bin: "03" } }) as never);
    expect(res.status).toBe(400);
  });

  it("physicalLocation missing bin → 400", async () => {
    const res = await PATCH(makeRequest({ productIds, physicalLocation: { zone: "A", shelf: "2" } }) as never);
    expect(res.status).toBe(400);
  });

  it("one product not found → 403 for entire batch (no partial writes)", async () => {
    mockProductFindById
      .mockResolvedValueOnce({ id: "product-hw-1", storeId: "store-diecast-depot" })
      .mockResolvedValueOnce(null) // product-hw-2 missing
      .mockResolvedValueOnce({ id: "product-hw-3", storeId: "store-diecast-depot" });
    const res = await PATCH(makeRequest({ productIds, physicalLocation: validLocation }) as never);
    expect(res.status).toBe(403);
    expect(mockProductUpdate).not.toHaveBeenCalled();
  });

  it("one product from different store → 403 for entire batch", async () => {
    mockProductFindById
      .mockResolvedValueOnce({ id: "product-hw-1", storeId: "store-diecast-depot" })
      .mockResolvedValueOnce({ id: "product-hw-2", storeId: "store-other" })
      .mockResolvedValueOnce({ id: "product-hw-3", storeId: "store-diecast-depot" });
    const res = await PATCH(makeRequest({ productIds, physicalLocation: validLocation }) as never);
    expect(res.status).toBe(403);
    expect(mockProductUpdate).not.toHaveBeenCalled();
  });

  it("all products owned → updates each with physicalLocation", async () => {
    mockProductFindById.mockResolvedValue({ id: "product-hw-1", storeId: "store-diecast-depot" });
    await PATCH(makeRequest({ productIds, physicalLocation: validLocation }) as never);
    expect(mockProductUpdate).toHaveBeenCalledTimes(3);
    expect(mockProductUpdate).toHaveBeenCalledWith(
      "product-hw-1",
      expect.objectContaining({ physicalLocation: validLocation }),
    );
  });

  it("returns { updated: productIds.length } on success", async () => {
    mockProductFindById.mockResolvedValue({ id: "product-hw-1", storeId: "store-diecast-depot" });
    const res = await PATCH(makeRequest({ productIds, physicalLocation: validLocation }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { updated: number } };
    expect(json.data.updated).toBe(3);
  });
});
