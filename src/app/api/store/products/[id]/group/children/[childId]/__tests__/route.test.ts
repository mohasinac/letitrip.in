/**
 * Tests for DELETE /api/store/products/[id]/group/children/[childId]
 * ROLES_STORE_WRITE + store:api:write. Uses createApiHandler.
 *
 * Unlinks a child product from a group.
 * Fetches parent and child in parallel.
 * Guards:
 * - Seller must have a store → 403
 * - Parent must exist → 404
 * - Child must exist → 404
 * - Parent must belong to seller's store → 403 (child store not checked — parent owns the group)
 *
 * Calls productRepository.unlinkChildFromGroup(parent, child).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwnerId,
  mockProductFindById,
  mockUnlinkChildFromGroup,
} = vi.hoisted(() => ({
  mockStoreFindByOwnerId: vi.fn(),
  mockProductFindById: vi.fn(),
  mockUnlinkChildFromGroup: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwnerId },
  productRepository: {
    findById: mockProductFindById,
    unlinkChildFromGroup: mockUnlinkChildFromGroup,
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  ApiErrors: {
    forbidden: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 403 }),
    notFound: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
  },
  createApiHandler: (opts: {
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request, { params }: { params: unknown } = { params: {} }) => {
      if (!_user) return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user, params });
    };
  },
}));

import { DELETE } from "../route";

const params = { params: { id: "product-hw-parent", childId: "product-hw-child-1" } };

const mockParent = {
  id: "product-hw-parent",
  storeId: "store-diecast-depot",
  isGroupParent: true,
  groupId: "product-hw-parent",
};
const mockChild = {
  id: "product-hw-child-1",
  storeId: "store-diecast-depot",
  isGroupParent: false,
  groupId: "product-hw-parent",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwnerId.mockResolvedValue({ id: "store-diecast-depot" });
  // findById called with parent then child (parallel via Promise.all)
  mockProductFindById
    .mockResolvedValueOnce(mockParent)
    .mockResolvedValueOnce(mockChild);
  mockUnlinkChildFromGroup.mockResolvedValue(undefined);
});

describe("DELETE /api/store/products/[id]/group/children/[childId]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(403);
  });

  it("seller with no store → 403", async () => {
    mockStoreFindByOwnerId.mockResolvedValue(null);
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(403);
  });

  it("parent not found → 404", async () => {
    mockProductFindById
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockChild);
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Parent");
  });

  it("child not found → 404", async () => {
    mockProductFindById
      .mockResolvedValueOnce(mockParent)
      .mockResolvedValueOnce(null);
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Child");
  });

  it("parent belongs to different store → 403", async () => {
    mockProductFindById
      .mockResolvedValueOnce({ ...mockParent, storeId: "store-other" })
      .mockResolvedValueOnce(mockChild);
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(403);
  });

  it("fetches parent and child by params id and childId respectively", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(mockProductFindById).toHaveBeenCalledWith("product-hw-parent");
    expect(mockProductFindById).toHaveBeenCalledWith("product-hw-child-1");
  });

  it("calls unlinkChildFromGroup with parent and child", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(mockUnlinkChildFromGroup).toHaveBeenCalledWith(mockParent, mockChild);
  });

  it("success → 200 with { unlinked: true }", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { unlinked: boolean } };
    expect(json.data.unlinked).toBe(true);
  });
});
