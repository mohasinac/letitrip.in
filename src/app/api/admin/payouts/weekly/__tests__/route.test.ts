/**
 * Tests for POST /api/admin/payouts/weekly
 * Requires ROLES_ADMIN_ONLY + admin:payouts:write.
 *
 * The route no longer runs the payout sweep synchronously — it enqueues an
 * async `payoutsWeekly` job (CLAUDE.md Rule #6) and returns immediately with
 * `{ jobId, customToken }`. The actual sweep (grouping orders by store,
 * computing net amount, creating payout docs) now lives in appkit's
 * `runWeeklyPayoutEligibility` core, shared with the scheduled Saturday run,
 * and is covered by appkit-side tests
 * (appkit/src/_internal/server/jobs/core/__tests__/weeklyPayoutEligibility.test.ts).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockEnqueueJob } = vi.hoisted(() => ({
  mockEnqueueJob: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/lib/features", () => ({ withFeatureGuard: (_flag: string, fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit/server", () => ({
  enqueueJob: mockEnqueueJob,
}));

vi.mock("@mohasinac/appkit", () => ({
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { user?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined });
    };
  },
}));

import { POST } from "../route";

const makeReq = () =>
  new Request("http://localhost/api/admin/payouts/weekly", { method: "POST" });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockEnqueueJob.mockResolvedValue({ jobId: "job-1", customToken: "token-1" });
});

describe("POST /api/admin/payouts/weekly", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("enqueues a payoutsWeekly job for the acting admin", async () => {
    await POST(makeReq() as never);
    expect(mockEnqueueJob).toHaveBeenCalledWith({
      jobType: "payoutsWeekly",
      payload: {},
      requestedBy: "admin-uid",
    });
  });

  it("success → 200 with { jobId, customToken }", async () => {
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { jobId: string; customToken: string } };
    expect(json.data.jobId).toBe("job-1");
    expect(json.data.customToken).toBe("token-1");
  });
});
