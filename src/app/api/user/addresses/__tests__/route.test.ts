import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockListByOwner,
  mockCountByOwner,
  mockCreateForOwner,
} = vi.hoisted(() => ({
  mockListByOwner: vi.fn(),
  mockCountByOwner: vi.fn(),
  mockCreateForOwner: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/validation/request-schemas", () => ({
  userAddressCreateSchema: {
    safeParse: (d: unknown) => {
      const data = d as Record<string, unknown>;
      if (!data?.fullName || !data?.addressLine1 || !data?.city || !data?.state || !data?.postalCode || !data?.country || !data?.phone) {
        return { success: false, error: { issues: [{ message: "Required fields missing" }] } };
      }
      return { success: true, data };
    },
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  addressesRepository: {
    listByOwner: mockListByOwner,
    countByOwner: mockCountByOwner,
    createForOwner: mockCreateForOwner,
  },
  serverLogger: { info: vi.fn() },
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  errorResponse: (error: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error }), { status }),
  SUCCESS_MESSAGES: { ADDRESS: { CREATED: "Address created" } },
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: unknown[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      }
      let body: unknown;
      if (request.method !== "GET") {
        try { body = await request.clone().json(); } catch { body = undefined; }
        if (opts.schema) {
          const result = opts.schema.safeParse(body);
          if (!result.success) return new Response(JSON.stringify({ ok: false, error: "Validation" }), { status: 400 });
          body = result.data;
        }
      }
      return opts.handler({ user: _user ?? undefined, body, request });
    };
  },
}));

import { GET, POST } from "../route";

const validAddress = {
  fullName: "Ravi Kumar",
  phone: "+911234567890",
  addressLine1: "123 MG Road",
  city: "Bangalore",
  state: "Karnataka",
  postalCode: "560001",
  country: "IN",
};

function makeGetReq(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost/api/user/addresses");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: "GET" });
}

function makePostReq(body: unknown): Request {
  return new Request("http://localhost/api/user/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "user-1", role: "user" };
  mockListByOwner.mockResolvedValue([
    { id: "addr-1", label: "Home", addressLine1: "123 MG Road", postalCode: "560001" },
    { id: "addr-2", label: "Office", addressLine1: "456 Brigade Road", postalCode: "560025" },
  ]);
  mockCountByOwner.mockResolvedValue(2);
  mockCreateForOwner.mockResolvedValue({ id: "addr-new", ...validAddress });
});

describe("GET /api/user/addresses", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("returns all addresses for the authenticated user", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: unknown[] };
    expect(json.data).toHaveLength(2);
  });

  it("delegates to addressesRepository.listByOwner with ownerType=user and uid", async () => {
    await GET(makeGetReq() as never);
    expect(mockListByOwner).toHaveBeenCalledWith("user", "user-1");
  });

  it("?q= filter: matching postalCode included", async () => {
    const res = await GET(makeGetReq({ q: "560001" }) as never);
    const json = await res.clone().json() as { data: Array<{ id: string }> };
    expect(json.data.some(a => a.id === "addr-1")).toBe(true);
  });

  it("?q= filter: non-matching address excluded", async () => {
    const res = await GET(makeGetReq({ q: "560001" }) as never);
    const json = await res.clone().json() as { data: Array<{ id: string }> };
    expect(json.data.some(a => a.id === "addr-2")).toBe(false);
  });
});

describe("POST /api/user/addresses", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq(validAddress) as never);
    expect(res.status).toBe(401);
  });

  it("missing fullName → 400", async () => {
    const res = await POST(makePostReq({ ...validAddress, fullName: undefined }) as never);
    expect(res.status).toBe(400);
  });

  it("missing addressLine1 → 400", async () => {
    const res = await POST(makePostReq({ ...validAddress, addressLine1: undefined }) as never);
    expect(res.status).toBe(400);
  });

  it("missing city → 400", async () => {
    const res = await POST(makePostReq({ ...validAddress, city: undefined }) as never);
    expect(res.status).toBe(400);
  });

  it("address count at limit (10) → 422", async () => {
    mockCountByOwner.mockResolvedValue(10);
    const res = await POST(makePostReq(validAddress) as never);
    expect(res.status).toBe(422);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("10");
  });

  it("creates address with ownerType=user and uid", async () => {
    await POST(makePostReq(validAddress) as never);
    expect(mockCreateForOwner).toHaveBeenCalledWith("user", "user-1", expect.any(Object));
  });

  it("success → 201 with address data", async () => {
    const res = await POST(makePostReq(validAddress) as never);
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { ok: boolean; data: { id: string } };
    expect(json.ok).toBe(true);
    expect(json.data.id).toBe("addr-new");
  });
});
