/**
 * Tests for GET/POST /api/store/addresses
 * GET: Returns store pickup addresses. No store → 403.
 * POST: Creates address scoped to ownerType="store" with seller's storeId.
 *       No store → 403.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwner,
  mockAddressesListByOwner,
  mockAddressesCreateForOwner,
} = vi.hoisted(() => ({
  mockStoreFindByOwner: vi.fn(),
  mockAddressesListByOwner: vi.fn(),
  mockAddressesCreateForOwner: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_STORE_READ: ["seller", "admin", "moderator"],
  ROLES_STORE_WRITE: ["seller", "admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { findByOwnerId: mockStoreFindByOwner },
  addressesRepository: {
    listByOwner: mockAddressesListByOwner,
    createForOwner: mockAddressesCreateForOwner,
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  ApiErrors: {
    forbidden: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 403 }),
    badRequest: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 }),
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false, error: result.error?.issues[0]?.message }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body });
    };
  },
}));

import { GET, POST } from "../route";

const makeGetReq = () => new Request("http://localhost/api/store/addresses");
const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/store/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockStore = { id: "store-pokemon-palace", ownerId: "seller-uid" };
const validAddress = {
  label: "Pickup Point A",
  fullName: "Ravi Kumar",
  phone: "9876543210",
  addressLine1: "123 Main Street",
  city: "Mumbai",
  state: "Maharashtra",
  postalCode: "400001",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwner.mockResolvedValue(mockStore);
  mockAddressesListByOwner.mockResolvedValue([]);
  mockAddressesCreateForOwner.mockResolvedValue({ id: "addr-1", ...validAddress });
});

describe("GET /api/store/addresses", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("no store → 403", async () => {
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("addresses fetched with ownerType=store and store's id", async () => {
    await GET(makeGetReq() as never);
    expect(mockAddressesListByOwner).toHaveBeenCalledWith("store", "store-pokemon-palace");
  });

  it("success → 200 with addresses array and total", async () => {
    mockAddressesListByOwner.mockResolvedValue([{ id: "addr-1" }, { id: "addr-2" }]);
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { addresses: unknown[]; total: number } };
    expect(json.data.total).toBe(2);
    expect(json.data.addresses).toHaveLength(2);
  });
});

describe("POST /api/store/addresses", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq(validAddress) as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await POST(makePostReq(validAddress) as never);
    expect(res.status).toBe(403);
  });

  it("no store → 403", async () => {
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await POST(makePostReq(validAddress) as never);
    expect(res.status).toBe(403);
  });

  it("missing label → 400", async () => {
    const { label: _, ...noLabel } = validAddress;
    const res = await POST(makePostReq(noLabel) as never);
    expect(res.status).toBe(400);
  });

  it("missing city → 400", async () => {
    const { city: _, ...noCity } = validAddress;
    const res = await POST(makePostReq(noCity) as never);
    expect(res.status).toBe(400);
  });

  it("address created with ownerType=store and seller's storeId", async () => {
    await POST(makePostReq(validAddress) as never);
    expect(mockAddressesCreateForOwner).toHaveBeenCalledWith(
      "store",
      "store-pokemon-palace",
      expect.objectContaining({ label: "Pickup Point A" }),
    );
  });

  it("country defaults to India when not provided", async () => {
    await POST(makePostReq(validAddress) as never);
    const createArg = mockAddressesCreateForOwner.mock.calls[0][2] as { country: string };
    expect(createArg.country).toBe("India");
  });

  it("success → 200 with created address", async () => {
    const res = await POST(makePostReq(validAddress) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("addr-1");
  });
});
