/**
 * Tests for POST /api/admin/users/[uid]/hard-ban
 * Admin-only. Runs cheap pre-flight guards (self-ban / target-exists /
 * admin-target) synchronously, then enqueues the 8-stage cascade as an async
 * `hardBanCascade` job (CLAUDE.md Rule #6) — the actual cascade logic lives
 * in appkit's `runHardBanCascade` core and is covered by appkit-side tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockFindById, mockEnqueueJob } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockEnqueueJob: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));
vi.mock("@mohasinac/appkit/server", () => ({
  enqueueJob: mockEnqueueJob,
}));

vi.mock("@mohasinac/appkit", () => ({
  userRepository: { findById: mockFindById },
  isAdminUser: (u: { role?: string }) => u?.role === "admin",
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
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
      return opts.handler({ user: _user ?? undefined, body, params });
    };
  },
}));

import { POST } from "../route";

const makeReq = (body: unknown) =>
  new Request("http://localhost/api/admin/users/user-ravi/hard-ban", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const buyerTarget = { id: "user-ravi", uid: "uid-ravi", role: "user", email: "ravi@test.com" };
const adminTarget = { id: "user-admin2", uid: "uid-admin2", role: "admin", email: "admin2@letitrip.in" };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(buyerTarget);
  mockEnqueueJob.mockResolvedValue({ jobId: "job-1", customToken: "token-1" });
});

describe("POST /api/admin/users/[uid]/hard-ban", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (admin-only)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(403);
  });

  it("missing reason → 400", async () => {
    const res = await POST(makeReq({}) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(400);
    expect(mockEnqueueJob).not.toHaveBeenCalled();
  });

  it("self-ban → 400 (cannot ban yourself)", async () => {
    const res = await POST(makeReq({ reason: "test" }) as never, { params: Promise.resolve({ uid: "admin-uid" }) });
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Cannot ban yourself");
    expect(mockEnqueueJob).not.toHaveBeenCalled();
  });

  it("user not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "nonexistent" }) });
    expect(res.status).toBe(404);
    expect(mockEnqueueJob).not.toHaveBeenCalled();
  });

  it("banning another admin → 400", async () => {
    mockFindById.mockResolvedValue(adminTarget);
    const res = await POST(makeReq({ reason: "Rogue admin" }) as never, { params: Promise.resolve({ uid: "uid-admin2" }) });
    expect(res.status).toBe(400);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toContain("Cannot ban an admin");
    expect(mockEnqueueJob).not.toHaveBeenCalled();
  });

  it("enqueues a hardBanCascade job with the target uid, reason, and acting admin", async () => {
    await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(mockEnqueueJob).toHaveBeenCalledWith({
      jobType: "hardBanCascade",
      payload: { uid: "user-ravi", reason: "Fraud", bannedBy: "admin-uid" },
      requestedBy: "admin-uid",
    });
  });

  it("success → 200 with { jobId, customToken, uid }", async () => {
    const res = await POST(makeReq({ reason: "Fraud" }) as never, { params: Promise.resolve({ uid: "user-ravi" }) });
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { jobId: string; customToken: string; uid: string } };
    expect(json.data.jobId).toBe("job-1");
    expect(json.data.customToken).toBe("token-1");
    expect(json.data.uid).toBe("user-ravi");
  });
});
