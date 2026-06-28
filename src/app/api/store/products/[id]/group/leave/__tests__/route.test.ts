/**
 * Tests for DELETE /api/store/products/[id]/group/leave
 * ROLES_STORE_WRITE + store:api:write. Uses createApiHandler.
 *
 * Child product leaves its group.
 * Guards:
 * - Seller must have a store → 403
 * - Product must exist → 404
 * - Product must belong to seller's store → 403
 * - Product must NOT be isGroupParent → 400 (parents must dissolve, not leave)
 * - Product must have a groupId → 400
 *
 * If child has groupParentSlug → fetches parent and passes to leaveGroup.
 * If no groupParentSlug → parent=null passed to leaveGroup.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwnerId,
  mockProductFindById,
  mockProductFindBySlug,
  mockLeaveGroup,
} = vi.hoisted(() => ({
  mockStoreFindByOwnerId: vi.fn(),
  mockProductFindById: vi.fn(),
  mockProductFindBySlug: vi.fn(),
  mockLeaveGroup: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwnerId },
  productRepository: {
    findById: mockProductFindById,
    findBySlug: mockProductFindBySlug,
    leaveGroup: mockLeaveGroup,
  },
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
  createApiHandler: (opts: {
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if (!_user) return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user, params });
    };
  },
}));

import { DELETE } from "../route";

const params = { params: Promise.resolve({ id: "product-hw-child-1" }) };

const mockParent = { id: "product-hw-parent", slug: "product-hw-parent", storeId: "store-diecast-depot" };
const mockChild = {
  id: "product-hw-child-1",
  storeId: "store-diecast-depot",
  isGroupParent: false,
  groupId: "product-hw-parent",
  groupParentSlug: "product-hw-parent",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwnerId.mockResolvedValue({ id: "store-diecast-depot" });
  mockProductFindById.mockResolvedValue(mockChild);
  mockProductFindBySlug.mockResolvedValue(mockParent);
  mockLeaveGroup.mockResolvedValue(undefined);
});

describe("DELETE /api/store/products/[id]/group/leave", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("seller with no store → 403", async () => {
    mockStoreFindByOwnerId.mockResolvedValue(null);
    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("product not found → 404", async () => {
    mockProductFindById.mockResolvedValue(null);
    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }) as never, params as never);
    expect(res.status).toBe(404);
  });

  it("product belongs to different store → 403", async () => {
    mockProductFindById.mockResolvedValue({ ...mockChild, storeId: "store-other" });
    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }) as never, params as never);
    expect(res.status).toBe(403);
  });

  it("product is a group parent → 400 (must use dissolve)", async () => {
    mockProductFindById.mockResolvedValue({ ...mockChild, isGroupParent: true });
    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }) as never, params as never);
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("dissolve");
  });

  it("product has no groupId → 400 (not in a group)", async () => {
    mockProductFindById.mockResolvedValue({ ...mockChild, groupId: undefined });
    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }) as never, params as never);
    expect(res.status).toBe(400);
  });

  it("calls leaveGroup(child, parent) when groupParentSlug exists", async () => {
    await DELETE(new Request("http://localhost", { method: "DELETE" }) as never, params as never);
    expect(mockProductFindBySlug).toHaveBeenCalledWith("product-hw-parent");
    expect(mockLeaveGroup).toHaveBeenCalledWith(mockChild, mockParent);
  });

  it("no groupParentSlug → calls leaveGroup(child, null)", async () => {
    mockProductFindById.mockResolvedValue({ ...mockChild, groupParentSlug: undefined });
    await DELETE(new Request("http://localhost", { method: "DELETE" }) as never, params as never);
    expect(mockProductFindBySlug).not.toHaveBeenCalled();
    expect(mockLeaveGroup).toHaveBeenCalledWith(expect.any(Object), null);
  });

  it("success → 200 with { left: true }", async () => {
    const res = await DELETE(new Request("http://localhost", { method: "DELETE" }) as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { left: boolean } };
    expect(json.data.left).toBe(true);
  });
});
