/**
 * Tests for GET/PATCH/DELETE /api/admin/addresses/[id]
 *
 * GET: ROLES_ADMIN_MOD — addressesRepository.findById(id); 404 if missing
 * PATCH: ROLES_ADMIN_ONLY — 404 guard; updateForOwner(ownerType, ownerId, id, body)
 * DELETE: ROLES_ADMIN_ONLY — 404 guard; deleteForOwner(ownerType, ownerId, id)
 *   postalCode must be exactly 6 chars (schema)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindById, mockUpdateForOwner, mockDeleteForOwner } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockUpdateForOwner: vi.fn(),
  mockDeleteForOwner: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  addressesRepository: {
    findById: mockFindById,
    updateForOwner: mockUpdateForOwner,
    deleteForOwner: mockDeleteForOwner,
  },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: <B = unknown>(opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (b: unknown) => { success: boolean; data?: B; error?: { format: () => unknown } } };
    handler: (ctx: { request: Request; params?: unknown; user?: { uid: string; role: string }; body?: B }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: B | undefined;
      if (opts.schema) {
        let raw: unknown = {};
        try { raw = await request.json(); } catch { /* empty */ }
        const parsed = opts.schema.safeParse(raw);
        if (!parsed.success) return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = parsed.data;
      }
      return opts.handler({ request, params, user: _user ?? undefined, body });
    };
  },
}));

import { GET, PATCH, DELETE } from "../route";

const mockAddress = {
  id: "addr-001",
  ownerType: "user" as const,
  ownerId: "user-ravi",
  label: "Home",
  fullName: "Ravi Kumar",
  phone: "9876543210",
  addressLine1: "123 Main St",
  city: "Mumbai",
  state: "Maharashtra",
  postalCode: "400001",
  country: "India",
  isDefault: false,
};

const routeParams = { params: Promise.resolve({ id: "addr-001" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(mockAddress);
  mockUpdateForOwner.mockResolvedValue({ ...mockAddress, label: "Updated" });
  mockDeleteForOwner.mockResolvedValue(undefined);
});

describe("GET /api/admin/addresses/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(200);
  });

  it("address not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Address not found");
  });

  it("found → 200 with address data", async () => {
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("addr-001");
  });
});

describe("PATCH /api/admin/addresses/[id]", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest({ city: "Delhi" }), routeParams as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeRequest({ city: "Delhi" }), routeParams as never);
    expect(res.status).toBe(403);
  });

  it("address not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ city: "Delhi" }), routeParams as never);
    expect(res.status).toBe(404);
  });

  it("postalCode with wrong length → 400", async () => {
    const res = await PATCH(makeRequest({ postalCode: "12345" }), routeParams as never);
    expect(res.status).toBe(400);
  });

  it("postalCode with 7 chars → 400", async () => {
    const res = await PATCH(makeRequest({ postalCode: "1234567" }), routeParams as never);
    expect(res.status).toBe(400);
  });

  it("valid postalCode (6 chars) → passes schema", async () => {
    const res = await PATCH(makeRequest({ postalCode: "400001" }), routeParams as never);
    expect(res.status).toBe(200);
  });

  it("calls updateForOwner with ownerType, ownerId from existing address", async () => {
    await PATCH(makeRequest({ city: "Delhi" }), routeParams as never);
    expect(mockUpdateForOwner).toHaveBeenCalledWith("user", "user-ravi", "addr-001", expect.any(Object));
  });

  it("success → 200 with 'Address updated' message", async () => {
    const res = await PATCH(makeRequest({ city: "Delhi" }), routeParams as never);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toBe("Address updated");
  });
});

describe("DELETE /api/admin/addresses/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(403);
  });

  it("address not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(404);
  });

  it("calls deleteForOwner with ownerType, ownerId from existing address", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(mockDeleteForOwner).toHaveBeenCalledWith("user", "user-ravi", "addr-001");
  });

  it("success → 200 with 'Address deleted' message and null data", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    const json = await res.clone().json() as { message: string; data: null };
    expect(json.message).toBe("Address deleted");
    expect(json.data).toBeNull();
  });
});
