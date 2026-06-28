/**
 * Tests for GET/PATCH/DELETE /api/user/addresses/[id]
 * Auth required. Any authenticated user.
 *
 * GET:    findById(id) → checks ownerType==="user" AND ownerId===uid → 404 if either fails.
 *         Prevents enumeration across ownerType boundary (store addresses also in same collection).
 *
 * PATCH:  addressesRepository.updateForOwner("user", uid, id, body)
 *         Ownership enforced inside updateForOwner — route does not independently verify.
 *
 * DELETE: addressesRepository.deleteForOwner("user", uid, id)
 *         Ownership enforced inside deleteForOwner — route does not independently verify.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindById, mockUpdateForOwner, mockDeleteForOwner } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUpdateForOwner: vi.fn(),
  mockDeleteForOwner: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  addressesRepository: {
    findById: mockFindById,
    updateForOwner: mockUpdateForOwner,
    deleteForOwner: mockDeleteForOwner,
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; request: Request; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      return opts.handler({ user: _user ?? undefined, request, params });
    };
  },
}));

import { GET, PATCH, DELETE } from "../route";

const params = { params: Promise.resolve({ id: "addr-user-home-001" }) };

const mockAddress = {
  id: "addr-user-home-001",
  ownerType: "user",
  ownerId: "buyer-uid",
  label: "Home",
  fullName: "Ravi Kumar",
  phone: "9876543210",
  addressLine1: "12 Main Street",
  city: "Mumbai",
  state: "Maharashtra",
  postalCode: "400001",
  country: "India",
  isDefault: true,
};

const makePatchRequest = (body: unknown) =>
  new Request("http://localhost/api/user/addresses/addr-user-home-001", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockFindById.mockResolvedValue(mockAddress);
  mockUpdateForOwner.mockResolvedValue({ ...mockAddress, label: "Updated" });
  mockDeleteForOwner.mockResolvedValue(undefined);
});

describe("GET /api/user/addresses/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("address not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("address belongs to a different user → 404 (prevents enumeration)", async () => {
    _user = { uid: "attacker-uid", role: "user" };
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("address ownerType=store (not user) → 404 even if ownerId matches uid", async () => {
    // A store address in the same collection — user must not access it
    mockFindById.mockResolvedValue({ ...mockAddress, ownerType: "store" });
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(404);
  });

  it("own user address → 200 with address data", async () => {
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string; label: string } };
    expect(json.data.id).toBe("addr-user-home-001");
    expect(json.data.label).toBe("Home");
  });
});

describe("PATCH /api/user/addresses/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makePatchRequest({ label: "Work" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("calls updateForOwner with ownerType=user, uid, id, and body", async () => {
    const update = { label: "Work", city: "Delhi" };
    await PATCH(makePatchRequest(update) as never, params as never);
    expect(mockUpdateForOwner).toHaveBeenCalledWith(
      "user",
      "buyer-uid",
      "addr-user-home-001",
      update,
    );
  });

  it("success → 200 with updated address", async () => {
    const res = await PATCH(makePatchRequest({ label: "Work" }) as never, params as never);
    expect(res.status).toBe(200);
  });

  it("updateForOwner handles ownership check internally (no separate findById in route)", async () => {
    // PATCH does not call findById — ownership enforced by updateForOwner
    await PATCH(makePatchRequest({ label: "Work" }) as never, params as never);
    expect(mockFindById).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/user/addresses/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(401);
  });

  it("calls deleteForOwner with ownerType=user, uid, and id", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(mockDeleteForOwner).toHaveBeenCalledWith("user", "buyer-uid", "addr-user-home-001");
  });

  it("success → 200", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(200);
  });

  it("deleteForOwner handles ownership — no findById call in route", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(mockFindById).not.toHaveBeenCalled();
  });
});
