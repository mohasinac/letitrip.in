/**
 * Tests for POST /api/store/products/[id]/group/children
 * ROLES_STORE_WRITE + store:api:write
 * Uses createApiHandler (not createRouteHandler) — mock must export createApiHandler.
 *
 * Two modes in body:
 *   mode="create": creates a new child product inheriting parent fields.
 *     - requires title and price → 400 if missing
 *     - child slug = `{parent.slug}-part-{base36timestamp}`
 *     - calls productRepository.addChildProduct(parent, childData)
 *     - returns 201
 *   mode="link": links existing product into the group.
 *     - requires childId → 400 if missing
 *     - child must not be an auction → 400
 *     - child must not already be in a group → 400
 *     - child must belong to seller's store → 403
 *     - calls productRepository.linkChildToGroup(parent, child)
 *
 * Parent product guards:
 *   - must exist → 404
 *   - must belong to seller's store → 403
 *   - must be isGroupParent=true → 400
 *   - must not be an auction → 400 (same product check)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwnerId,
  mockProductFindById,
  mockAddChildProduct,
  mockLinkChildToGroup,
} = vi.hoisted(() => ({
  mockStoreFindByOwnerId: vi.fn(),
  mockProductFindById: vi.fn(),
  mockAddChildProduct: vi.fn(),
  mockLinkChildToGroup: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwnerId },
  productRepository: {
    findById: mockProductFindById,
    addChildProduct: mockAddChildProduct,
    linkChildToGroup: mockLinkChildToGroup,
  },
  isAuctionListing: (p: { listingType?: string }) => p.listingType === "auction",
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  ApiErrors: {
    forbidden: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 403 }),
    notFound: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
    badRequest: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 }),
  },
  createApiHandler: (opts: {
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; request: Request; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
      if (!_user) return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user, request, params });
    };
  },
}));

import { POST } from "../route";

const params = { params: Promise.resolve({ id: "product-hot-wheels-parent" }) };

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/store/products/product-hot-wheels-parent/group/children", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockParent = {
  id: "product-hot-wheels-parent",
  slug: "product-hot-wheels-parent",
  storeId: "store-diecast-depot",
  listingType: "standard",
  isGroupParent: true,
  groupId: "product-hot-wheels-parent",
  currency: "INR",
  categorySlugs: ["category-diecast"],
  brand: "brand-hot-wheels",
  tags: ["hot-wheels"],
  shippingInfo: null,
  returnPolicy: null,
  storeName: "Diecast Depot",
};

const mockChild = {
  id: "product-hw-child-1",
  storeId: "store-diecast-depot",
  listingType: "standard",
  groupId: undefined as string | undefined,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwnerId.mockResolvedValue({ id: "store-diecast-depot" });
  // Use mockImplementation so individual tests can override with mockResolvedValueOnce
  // without the queue growing across beforeEach + test body calls
  mockProductFindById.mockImplementation(async (id: string) => {
    if (id === "product-hot-wheels-parent") return mockParent;
    if (id === "product-hw-child-1") return mockChild;
    return null;
  });
  mockAddChildProduct.mockResolvedValue({ ...mockParent, id: "product-hw-new-child" });
  mockLinkChildToGroup.mockResolvedValue(undefined);
});

describe("POST /api/store/products/[id]/group/children — auth guards", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeRequest({ mode: "create", title: "T", price: 100 }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await POST(makeRequest({ mode: "create", title: "T", price: 100 }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("seller with no store → 403", async () => {
    mockStoreFindByOwnerId.mockResolvedValue(null);
    const res = await POST(makeRequest({ mode: "create", title: "T", price: 100 }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("parent not found → 404", async () => {
    mockProductFindById.mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ mode: "create", title: "T", price: 100 }) as never, params as never);
    expect(res.status).toBe(404);
  });

  it("parent belongs to different store → 403", async () => {
    mockProductFindById.mockResolvedValueOnce({ ...mockParent, storeId: "store-other" });
    const res = await POST(makeRequest({ mode: "create", title: "T", price: 100 }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("parent is not a group parent → 400", async () => {
    mockProductFindById.mockResolvedValueOnce({ ...mockParent, isGroupParent: false });
    const res = await POST(makeRequest({ mode: "create", title: "T", price: 100 }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("invalid mode → 400", async () => {
    const res = await POST(makeRequest({ mode: "destroy" }) as never, params as never);
    expect(res.status).toBe(400);
  });
});

describe("POST — mode=create", () => {
  it("missing title → 400", async () => {
    const res = await POST(makeRequest({ mode: "create", price: 1000 }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("missing price → 400", async () => {
    const res = await POST(makeRequest({ mode: "create", title: "New Part" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("valid create → calls addChildProduct with parent and child data", async () => {
    await POST(makeRequest({ mode: "create", title: "Red Variant", price: 5000 }) as never, params as never);
    expect(mockAddChildProduct).toHaveBeenCalledWith(
      mockParent,
      expect.objectContaining({ title: "Red Variant", price: 5000, listingType: "standard" }),
    );
  });

  it("condition defaults to 'new' if not provided", async () => {
    await POST(makeRequest({ mode: "create", title: "T", price: 100 }) as never, params as never);
    const childData = mockAddChildProduct.mock.calls[0][1] as { condition: string };
    expect(childData.condition).toBe("new");
  });

  it("success → 201", async () => {
    const res = await POST(makeRequest({ mode: "create", title: "Red Variant", price: 5000 }) as never, params as never);
    expect(res.status).toBe(201);
  });
});

describe("POST — mode=link", () => {
  it("missing childId → 400", async () => {
    const res = await POST(makeRequest({ mode: "link" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("child not found → 404", async () => {
    mockProductFindById
      .mockResolvedValueOnce(mockParent)
      .mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ mode: "link", childId: "product-missing" }) as never, params as never);
    expect(res.status).toBe(404);
  });

  it("child is an auction → 400", async () => {
    mockProductFindById
      .mockResolvedValueOnce(mockParent)
      .mockResolvedValueOnce({ ...mockChild, listingType: "auction" });
    const res = await POST(makeRequest({ mode: "link", childId: "auction-pikachu" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("child already in a group → 400", async () => {
    mockProductFindById
      .mockResolvedValueOnce(mockParent)
      .mockResolvedValueOnce({ ...mockChild, groupId: "some-existing-group" });
    const res = await POST(makeRequest({ mode: "link", childId: "product-hw-child-1" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("child belongs to different store → 403", async () => {
    mockProductFindById
      .mockResolvedValueOnce(mockParent)
      .mockResolvedValueOnce({ ...mockChild, storeId: "store-other" });
    const res = await POST(makeRequest({ mode: "link", childId: "product-hw-child-1" }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("valid link → calls linkChildToGroup(parent, child)", async () => {
    await POST(makeRequest({ mode: "link", childId: "product-hw-child-1" }) as never, params as never);
    expect(mockLinkChildToGroup).toHaveBeenCalledWith(mockParent, mockChild);
  });

  it("success → 200", async () => {
    const res = await POST(makeRequest({ mode: "link", childId: "product-hw-child-1" }) as never, params as never);
    expect(res.status).toBe(200);
  });
});
