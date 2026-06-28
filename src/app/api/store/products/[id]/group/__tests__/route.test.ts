/**
 * Tests for POST/PATCH/DELETE /api/store/products/[id]/group
 * ROLES_STORE_WRITE + store:api:write
 *
 * POST (start group): product becomes group parent.
 *   - Product must belong to seller's store → 403 if not
 *   - Product must not be an auction → 400
 *   - Product must not already be in a group → 400
 *   - Uses product.slug ?? product.id as groupId
 *   - Calls productRepository.startGroup(product.id, slug)
 *
 * PATCH (update groupTitle):
 *   - Product must be isGroupParent=true → 400 if not
 *   - Falls back to empty string if body.groupTitle undefined
 *
 * DELETE (dissolve group):
 *   - Product must be isGroupParent=true → 400 if not
 *   - Product must have groupId → 400 if not
 *   - Calls productRepository.dissolveGroup(product.groupId)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwnerId,
  mockProductFindById,
  mockStartGroup,
  mockUpdateGroupTitle,
  mockDissolveGroup,
} = vi.hoisted(() => ({
  mockStoreFindByOwnerId: vi.fn(),
  mockProductFindById: vi.fn(),
  mockStartGroup: vi.fn(),
  mockUpdateGroupTitle: vi.fn(),
  mockDissolveGroup: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwnerId },
  productRepository: {
    findById: mockProductFindById,
    startGroup: mockStartGroup,
    updateGroupTitle: mockUpdateGroupTitle,
    dissolveGroup: mockDissolveGroup,
  },
  isAuctionListing: (p: { listingType?: string }) => p.listingType === "auction",
  successResponse: (data: unknown, _msg?: string) =>
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

import { POST, PATCH, DELETE } from "../route";

const params = { params: { id: "product-hot-wheels-redline" } };

const baseProduct = {
  id: "product-hot-wheels-redline",
  slug: "product-hot-wheels-redline",
  storeId: "store-diecast-depot",
  listingType: "standard",
  isGroupParent: false,
  groupId: undefined as string | undefined,
  digitalCode: undefined as unknown,
};

const makeRequest = (method: string, body?: unknown) =>
  new Request("http://localhost/api/store/products/product-hot-wheels-redline/group", {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwnerId.mockResolvedValue({ id: "store-diecast-depot" });
  mockProductFindById.mockResolvedValue({ ...baseProduct });
  mockStartGroup.mockResolvedValue(undefined);
  mockUpdateGroupTitle.mockResolvedValue(undefined);
  mockDissolveGroup.mockResolvedValue(undefined);
});

describe("POST /api/store/products/[id]/group (start group)", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeRequest("POST") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403 (not in ROLES_STORE_WRITE)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await POST(makeRequest("POST") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("seller with no store → 403", async () => {
    mockStoreFindByOwnerId.mockResolvedValue(null);
    const res = await POST(makeRequest("POST") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("product not found → 404", async () => {
    mockProductFindById.mockResolvedValue(null);
    const res = await POST(makeRequest("POST") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("product belongs to different store → 403", async () => {
    mockProductFindById.mockResolvedValue({ ...baseProduct, storeId: "store-other" });
    const res = await POST(makeRequest("POST") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("product is an auction → 400", async () => {
    mockProductFindById.mockResolvedValue({ ...baseProduct, listingType: "auction" });
    const res = await POST(makeRequest("POST") as never, params as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Auctions");
  });

  it("product already in a group → 400", async () => {
    mockProductFindById.mockResolvedValue({ ...baseProduct, groupId: "product-hot-wheels-redline" });
    const res = await POST(makeRequest("POST") as never, params as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("already in a group");
  });

  it("valid product → calls startGroup with product.id and slug", async () => {
    await POST(makeRequest("POST") as never, params as never);
    expect(mockStartGroup).toHaveBeenCalledWith(
      "product-hot-wheels-redline",
      "product-hot-wheels-redline",
    );
  });

  it("product has no slug → falls back to product.id as groupId", async () => {
    mockProductFindById.mockResolvedValue({ ...baseProduct, slug: undefined });
    await POST(makeRequest("POST") as never, params as never);
    expect(mockStartGroup).toHaveBeenCalledWith(
      "product-hot-wheels-redline",
      "product-hot-wheels-redline",
    );
  });

  it("success → 200 with { groupId }", async () => {
    const res = await POST(makeRequest("POST") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { groupId: string } };
    expect(json.data.groupId).toBe("product-hot-wheels-redline");
  });
});

describe("PATCH /api/store/products/[id]/group (update groupTitle)", () => {
  beforeEach(() => {
    mockProductFindById.mockResolvedValue({ ...baseProduct, isGroupParent: true });
  });

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest("PATCH", { groupTitle: "Redline Series" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("product not a group parent → 400", async () => {
    mockProductFindById.mockResolvedValue({ ...baseProduct, isGroupParent: false });
    const res = await PATCH(makeRequest("PATCH", { groupTitle: "Test" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("updates groupTitle on group parent product", async () => {
    await PATCH(makeRequest("PATCH", { groupTitle: "Redline Series" }) as never, params as never);
    expect(mockUpdateGroupTitle).toHaveBeenCalledWith(
      "product-hot-wheels-redline",
      "Redline Series",
    );
  });

  it("no groupTitle in body → updates with empty string", async () => {
    await PATCH(makeRequest("PATCH", {}) as never, params as never);
    expect(mockUpdateGroupTitle).toHaveBeenCalledWith("product-hot-wheels-redline", "");
  });

  it("success → 200 with { groupTitle }", async () => {
    const res = await PATCH(makeRequest("PATCH", { groupTitle: "Redline Series" }) as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { groupTitle: string } };
    expect(json.data.groupTitle).toBe("Redline Series");
  });
});

describe("DELETE /api/store/products/[id]/group (dissolve group)", () => {
  beforeEach(() => {
    mockProductFindById.mockResolvedValue({
      ...baseProduct,
      isGroupParent: true,
      groupId: "product-hot-wheels-redline",
    });
  });

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("product not a group parent → 400", async () => {
    mockProductFindById.mockResolvedValue({ ...baseProduct, isGroupParent: false, groupId: "some-group" });
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(400);
  });

  it("product has no groupId → 400", async () => {
    mockProductFindById.mockResolvedValue({ ...baseProduct, isGroupParent: true, groupId: undefined });
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(400);
  });

  it("calls dissolveGroup with product.groupId", async () => {
    await DELETE(makeRequest("DELETE") as never, params as never);
    expect(mockDissolveGroup).toHaveBeenCalledWith("product-hot-wheels-redline");
  });

  it("success → 200", async () => {
    const res = await DELETE(makeRequest("DELETE") as never, params as never);
    expect(res.status).toBe(200);
  });
});
