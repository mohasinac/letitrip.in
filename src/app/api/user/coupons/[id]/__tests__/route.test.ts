/**
 * Tests for DELETE /api/user/coupons/[id]
 * Soft-removes a claimed coupon from the user's wallet (status → "expired").
 * The claim document is preserved for audit; only the status changes.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindById,
  mockSoftRemove,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockSoftRemove: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  claimedCouponsRepository: {
    findById: mockFindById,
    softRemove: mockSoftRemove,
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  ApiErrors: {
    badRequest: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 }),
    notFound: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 404 }),
    forbidden: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 403 }),
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (_req: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      return opts.handler({ user: _user ?? undefined, params });
    };
  },
}));

import { DELETE } from "../route";

const mockClaim = {
  id: "claim-abc",
  userId: "buyer-uid",
  couponCode: "WELCOME10",
  status: "active",
};

const makeReq = () =>
  new Request("http://localhost/api/user/coupons/claim-abc", { method: "DELETE" });

const mockContext = { params: Promise.resolve({ id: "claim-abc" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockFindById.mockResolvedValue(mockClaim);
  mockSoftRemove.mockResolvedValue(undefined);
});

describe("DELETE /api/user/coupons/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(makeReq() as never, mockContext as never);
    expect(res.status).toBe(401);
  });

  it("claim not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await DELETE(makeReq() as never, mockContext as never);
    expect(res.status).toBe(404);
  });

  it("claim belongs to a different user → 403", async () => {
    mockFindById.mockResolvedValue({ ...mockClaim, userId: "other-user-uid" });
    const res = await DELETE(makeReq() as never, mockContext as never);
    expect(res.status).toBe(403);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("own");
  });

  it("valid → softRemove called with userId + couponCode from the claim", async () => {
    await DELETE(makeReq() as never, mockContext as never);
    expect(mockSoftRemove).toHaveBeenCalledWith("buyer-uid", "WELCOME10");
  });

  it("valid → does NOT delete the claim document (softRemove, not hardDelete)", async () => {
    await DELETE(makeReq() as never, mockContext as never);
    // softRemove sets status to 'expired'; there should be no hard delete call
    expect(mockSoftRemove).toHaveBeenCalledTimes(1);
  });

  it("success → 200 with { id } in response data", async () => {
    const res = await DELETE(makeReq() as never, mockContext as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean; data: { id: string } };
    expect(json.ok).toBe(true);
    expect(json.data.id).toBe("claim-abc");
  });

  it("findById called with the correct claim id from params", async () => {
    await DELETE(makeReq() as never, mockContext as never);
    expect(mockFindById).toHaveBeenCalledWith("claim-abc");
  });
});
