/**
 * Tests for GET /api/user/coupons
 * Lists the authenticated user's claimed coupons grouped by status.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockListForUser } = vi.hoisted(() => ({
  mockListForUser: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  claimedCouponsRepository: { listForUser: mockListForUser },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown }) => Promise<Response>;
  }) => {
    return async (_req: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      return opts.handler({ user: _user ?? undefined });
    };
  },
}));

import { GET } from "../route";

const makeClaim = (status: "active" | "expired" | "used", claimedAt: string) => ({
  id: `claim-${claimedAt}`,
  userId: "buyer-uid",
  couponCode: "CODE",
  status,
  claimedAt,
});

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockListForUser.mockResolvedValue([
    makeClaim("active", "2026-06-01T10:00:00Z"),
    makeClaim("expired", "2026-05-01T10:00:00Z"),
    makeClaim("used", "2026-04-01T10:00:00Z"),
    makeClaim("active", "2026-06-15T10:00:00Z"),
  ]);
});

describe("GET /api/user/coupons", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/user/coupons") as never);
    expect(res.status).toBe(401);
  });

  it("delegates to claimedCouponsRepository.listForUser with uid", async () => {
    await GET(new Request("http://localhost/api/user/coupons") as never);
    expect(mockListForUser).toHaveBeenCalledWith("buyer-uid");
  });

  it("groups coupons by status: active / expired / used", async () => {
    const res = await GET(new Request("http://localhost/api/user/coupons") as never);
    const json = await res.clone().json() as {
      data: { active: unknown[]; expired: unknown[]; used: unknown[]; total: number };
    };
    expect(json.data.active).toHaveLength(2);
    expect(json.data.expired).toHaveLength(1);
    expect(json.data.used).toHaveLength(1);
  });

  it("sorts active coupons newest-first by claimedAt", async () => {
    const res = await GET(new Request("http://localhost/api/user/coupons") as never);
    const json = await res.clone().json() as {
      data: { active: Array<{ claimedAt: string }> };
    };
    const [first, second] = json.data.active;
    expect(new Date(first!.claimedAt).getTime()).toBeGreaterThan(new Date(second!.claimedAt).getTime());
  });

  it("returns total count of all claims across all statuses", async () => {
    const res = await GET(new Request("http://localhost/api/user/coupons") as never);
    const json = await res.clone().json() as { data: { total: number } };
    expect(json.data.total).toBe(4);
  });

  it("empty wallet → all buckets empty, total 0", async () => {
    mockListForUser.mockResolvedValue([]);
    const res = await GET(new Request("http://localhost/api/user/coupons") as never);
    const json = await res.clone().json() as {
      data: { active: unknown[]; expired: unknown[]; used: unknown[]; total: number };
    };
    expect(json.data.active).toHaveLength(0);
    expect(json.data.total).toBe(0);
  });
});
