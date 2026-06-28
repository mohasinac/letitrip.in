/**
 * Tests for GET/PATCH/DELETE /api/admin/contact-submissions/[id]
 *
 * GET: ROLES_ADMIN_MOD — findById; 404 if not found
 * PATCH: ROLES_ADMIN_MOD — action enum: "read" | "resolved" | "delete"
 *   - "read" → markRead
 *   - "resolved" → markResolved
 *   - "delete" → deleteById
 *   - 404 if submission not found
 * DELETE: ROLES_ADMIN_ONLY — deleteById; 404 if not found
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFindById,
  mockMarkRead,
  mockMarkResolved,
  mockDeleteById,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockMarkRead: vi.fn(),
  mockMarkResolved: vi.fn(),
  mockDeleteById: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  contactSubmissionsRepository: {
    findById: mockFindById,
    markRead: mockMarkRead,
    markResolved: mockMarkResolved,
    deleteById: mockDeleteById,
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

const mockSubmission = {
  id: "contact-001",
  subject: "Inquiry about refund",
  email: "buyer@example.com",
  status: "unread",
};

const routeParams = { params: Promise.resolve({ id: "contact-001" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFindById.mockResolvedValue(mockSubmission);
  mockMarkRead.mockResolvedValue(undefined);
  mockMarkResolved.mockResolvedValue(undefined);
  mockDeleteById.mockResolvedValue(undefined);
});

describe("GET /api/admin/contact-submissions/[id]", () => {
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

  it("submission not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Submission not found.");
  });

  it("found → 200 with submission data", async () => {
    const res = await GET(new Request("http://localhost") as never, routeParams as never);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("contact-001");
  });
});

describe("PATCH /api/admin/contact-submissions/[id]", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest({ action: "read" }), routeParams as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PATCH(makeRequest({ action: "read" }), routeParams as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeRequest({ action: "read" }), routeParams as never);
    expect(res.status).toBe(200);
  });

  it("missing action → 400 (schema validation)", async () => {
    const res = await PATCH(makeRequest({}), routeParams as never);
    expect(res.status).toBe(400);
  });

  it("invalid action value → 400 (enum)", async () => {
    const res = await PATCH(makeRequest({ action: "archive" }), routeParams as never);
    expect(res.status).toBe(400);
  });

  it("submission not found → 404 (guard before action dispatch)", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ action: "read" }), routeParams as never);
    expect(res.status).toBe(404);
  });

  it("action=read → calls markRead, returns 'Marked as read'", async () => {
    const res = await PATCH(makeRequest({ action: "read" }), routeParams as never);
    expect(mockMarkRead).toHaveBeenCalledWith("contact-001");
    const json = await res.clone().json() as { message: string };
    expect(json.message).toBe("Marked as read");
  });

  it("action=resolved → calls markResolved, returns 'Marked as resolved'", async () => {
    const res = await PATCH(makeRequest({ action: "resolved" }), routeParams as never);
    expect(mockMarkResolved).toHaveBeenCalledWith("contact-001");
    const json = await res.clone().json() as { message: string };
    expect(json.message).toBe("Marked as resolved");
  });

  it("action=delete → calls deleteById, returns 'Submission deleted'", async () => {
    const res = await PATCH(makeRequest({ action: "delete" }), routeParams as never);
    expect(mockDeleteById).toHaveBeenCalledWith("contact-001");
    const json = await res.clone().json() as { message: string };
    expect(json.message).toBe("Submission deleted");
  });

  it("action=read → does NOT call markResolved or deleteById", async () => {
    await PATCH(makeRequest({ action: "read" }), routeParams as never);
    expect(mockMarkResolved).not.toHaveBeenCalled();
    expect(mockDeleteById).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/admin/contact-submissions/[id]", () => {
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

  it("submission not found → 404", async () => {
    mockFindById.mockResolvedValue(null);
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(res.status).toBe(404);
  });

  it("calls deleteById with the submission id", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    expect(mockDeleteById).toHaveBeenCalledWith("contact-001");
  });

  it("success → 200 with 'Submission deleted' and null data", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      routeParams as never,
    );
    const json = await res.clone().json() as { message: string; data: null };
    expect(json.message).toBe("Submission deleted");
    expect(json.data).toBeNull();
  });
});
