/**
 * Tests for POST /api/store/payouts/request
 * Seller requests a payout via requestPayout action.
 * Validates paymentMethod enum (bank_transfer | upi).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string; email?: string; displayName?: string } | null = null;

const { mockRequestPayout } = vi.hoisted(() => ({
  mockRequestPayout: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  requestPayout: mockRequestPayout,
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
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

import { POST } from "../route";

const makeReq = (body: unknown) =>
  new Request("http://localhost/api/store/payouts/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockPayout = { id: "payout-1", amount: 50000, status: "PENDING" };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller", email: "seller@test.com", displayName: "Seller Name" };
  mockRequestPayout.mockResolvedValue(mockPayout);
});

describe("POST /api/store/payouts/request", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq({ paymentMethod: "upi" }) as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await POST(makeReq({ paymentMethod: "upi" }) as never);
    expect(res.status).toBe(403);
  });

  it("missing paymentMethod → 400", async () => {
    const res = await POST(makeReq({}) as never);
    expect(res.status).toBe(400);
  });

  it("invalid paymentMethod → 400", async () => {
    const res = await POST(makeReq({ paymentMethod: "crypto" }) as never);
    expect(res.status).toBe(400);
  });

  it("bank_transfer → calls requestPayout with correct args", async () => {
    await POST(makeReq({ paymentMethod: "bank_transfer" }) as never);
    expect(mockRequestPayout).toHaveBeenCalledWith(
      "seller-uid",
      "Seller Name",
      "seller@test.com",
      expect.objectContaining({ paymentMethod: "bank_transfer" }),
    );
  });

  it("upi → calls requestPayout with correct args", async () => {
    await POST(makeReq({ paymentMethod: "upi" }) as never);
    expect(mockRequestPayout).toHaveBeenCalledWith(
      "seller-uid",
      "Seller Name",
      "seller@test.com",
      expect.objectContaining({ paymentMethod: "upi" }),
    );
  });

  it("notes provided → forwarded to requestPayout", async () => {
    await POST(makeReq({ paymentMethod: "upi", notes: "Please process ASAP" }) as never);
    expect(mockRequestPayout).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ notes: "Please process ASAP" }),
    );
  });

  it("no displayName → passes empty string", async () => {
    _user = { uid: "seller-uid", role: "seller", email: "seller@test.com" };
    await POST(makeReq({ paymentMethod: "upi" }) as never);
    expect(mockRequestPayout).toHaveBeenCalledWith(
      "seller-uid",
      "",
      "seller@test.com",
      expect.any(Object),
    );
  });

  it("success → 200 with payout record", async () => {
    const res = await POST(makeReq({ paymentMethod: "upi" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { payout: typeof mockPayout } };
    expect(json.data.payout.id).toBe("payout-1");
  });
});
