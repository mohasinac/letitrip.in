/**
 * Tests for GET /api/admin/newsletter/export
 *
 * Roles: ROLES_ADMIN_MOD
 * Enqueues an async `newsletterExport` job (Async Job Primitive) instead of
 * building the CSV in-process — CSV-building logic itself is now covered by
 * appkit/src/_internal/server/jobs/core/__tests__/newsletterExport.test.ts.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockEnqueueJob } = vi.hoisted(() => ({
  mockEnqueueJob: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  successResponse: (data: unknown, message?: string) =>
    new Response(JSON.stringify({ ok: true, data, message }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { user?: { uid: string; role: string } }) => Promise<Response>;
  }) => {
    return async () => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined });
    };
  },
}));

vi.mock("@mohasinac/appkit/server", () => ({
  enqueueJob: mockEnqueueJob,
}));

import { GET } from "../route";

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockEnqueueJob.mockResolvedValue({ jobId: "job-1", customToken: "token-1" });
});

describe("GET /api/admin/newsletter/export", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost/api/admin/newsletter/export") as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost/api/admin/newsletter/export") as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost/api/admin/newsletter/export") as never);
    expect(res.status).toBe(200);
  });

  it("enqueues a newsletterExport job requested by the admin", async () => {
    await GET(new Request("http://localhost/api/admin/newsletter/export") as never);
    expect(mockEnqueueJob).toHaveBeenCalledWith(
      expect.objectContaining({ jobType: "newsletterExport", requestedBy: "admin-uid" }),
    );
  });

  it("returns jobId + customToken from the enqueue result", async () => {
    const res = await GET(new Request("http://localhost/api/admin/newsletter/export") as never);
    const body = await res.json();
    expect(body.data).toEqual({ jobId: "job-1", customToken: "token-1" });
  });
});
