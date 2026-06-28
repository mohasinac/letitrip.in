/**
 * Tests for GET /api/admin/addresses and POST /api/admin/addresses
 *
 * GET: ROLES_ADMIN_MOD — listByOwner only when both ownerType + ownerId present
 *   Without both params → { items: [], total: 0 }
 * POST: ROLES_ADMIN_ONLY — createForOwner(ownerType, ownerId, input), 201
 *   Schema: postalCode must be exactly 6 digits
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockListByOwner,
  mockCreateForOwner,
} = vi.hoisted(() => ({
  mockListByOwner: vi.fn(),
  mockCreateForOwner: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  addressesRepository: {
    listByOwner: mockListByOwner,
    createForOwner: mockCreateForOwner,
  },
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  createRouteHandler: <B = unknown>(opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (b: unknown) => { success: boolean; data?: B; error?: { format: () => unknown } } };
    handler: (ctx: { request: Request; params?: unknown; user?: { uid: string; role: string }; body?: B }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });

      let body: B | undefined;
      if (opts.schema) {
        let raw: unknown = {};
        try { raw = await request.json(); } catch { /* empty */ }
        const parsed = opts.schema.safeParse(raw);
        if (!parsed.success)
          return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = parsed.data;
      }

      return opts.handler({ request, user: _user ?? undefined, body });
    };
  },
}));

import { GET, POST } from "../route";

const validAddress = {
  ownerType: "user" as const,
  ownerId: "user-ravi-k",
  label: "Home",
  fullName: "Ravi Kumar",
  phone: "+919876543210",
  addressLine1: "12 Main St",
  city: "Chennai",
  state: "Tamil Nadu",
  postalCode: "600001",
  country: "India",
  isDefault: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockListByOwner.mockResolvedValue([]);
  mockCreateForOwner.mockResolvedValue({ id: "addr-001", ...validAddress });
});

describe("GET /api/admin/addresses", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/addresses") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/addresses") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/addresses") as never);
    expect(res.status).toBe(200);
  });

  it("missing both ownerType and ownerId → { items: [], total: 0 }", async () => {
    const res = await GET(new Request("http://localhost/api/admin/addresses") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(0);
    expect(json.data.total).toBe(0);
    expect(mockListByOwner).not.toHaveBeenCalled();
  });

  it("missing ownerId only → { items: [], total: 0 }", async () => {
    const res = await GET(new Request("http://localhost/api/admin/addresses?ownerType=user") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(0);
    expect(mockListByOwner).not.toHaveBeenCalled();
  });

  it("missing ownerType only → { items: [], total: 0 }", async () => {
    const res = await GET(new Request("http://localhost/api/admin/addresses?ownerId=user-ravi-k") as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(0);
    expect(mockListByOwner).not.toHaveBeenCalled();
  });

  it("both params present → calls listByOwner(ownerType, ownerId)", async () => {
    mockListByOwner.mockResolvedValue([{ id: "addr-001" }, { id: "addr-002" }]);
    const res = await GET(
      new Request("http://localhost/api/admin/addresses?ownerType=user&ownerId=user-ravi-k") as never,
    );
    expect(mockListByOwner).toHaveBeenCalledWith("user", "user-ravi-k");
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(2);
    expect(json.data.total).toBe(2);
  });

  it("store owner type also supported", async () => {
    await GET(
      new Request("http://localhost/api/admin/addresses?ownerType=store&ownerId=store-pokemon-palace") as never,
    );
    expect(mockListByOwner).toHaveBeenCalledWith("store", "store-pokemon-palace");
  });
});

describe("POST /api/admin/addresses", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost/api/admin/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeRequest(validAddress));
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makeRequest(validAddress));
    expect(res.status).toBe(403);
  });

  it("missing fullName → 400", async () => {
    const { fullName: _, ...noName } = validAddress;
    const res = await POST(makeRequest(noName));
    expect(res.status).toBe(400);
  });

  it("postalCode < 6 chars → 400", async () => {
    const res = await POST(makeRequest({ ...validAddress, postalCode: "60000" }));
    expect(res.status).toBe(400);
  });

  it("postalCode > 6 chars → 400", async () => {
    const res = await POST(makeRequest({ ...validAddress, postalCode: "6000001" }));
    expect(res.status).toBe(400);
  });

  it("postalCode exactly 6 chars → 201", async () => {
    const res = await POST(makeRequest(validAddress));
    expect(res.status).toBe(201);
  });

  it("invalid ownerType → 400", async () => {
    const res = await POST(makeRequest({ ...validAddress, ownerType: "admin" }));
    expect(res.status).toBe(400);
  });

  it("calls createForOwner(ownerType, ownerId, input)", async () => {
    await POST(makeRequest(validAddress));
    expect(mockCreateForOwner).toHaveBeenCalledWith(
      "user",
      "user-ravi-k",
      expect.objectContaining({ label: "Home", fullName: "Ravi Kumar" }),
    );
    // ownerType/ownerId not in the input object (destructured separately)
    const call = mockCreateForOwner.mock.calls[0];
    expect(call[2]).not.toHaveProperty("ownerType");
    expect(call[2]).not.toHaveProperty("ownerId");
  });

  it("country defaults to 'India' when omitted", async () => {
    const { country: _, ...noCountry } = validAddress;
    await POST(makeRequest(noCountry));
    expect(mockCreateForOwner).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ country: "India" }),
    );
  });
});
