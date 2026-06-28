/**
 * Tests for PATCH /api/admin/events/[id]/entries/[entryId]
 *
 * Roles: ROLES_ADMIN_MOD
 * Schema: { status: "approved"|"rejected"|"flagged", reviewNote?: string, points?: number }
 * Calls: eventEntryRepository.reviewEntry(entryId, status, user.uid, reviewNote, points)
 * Returns: { entryId, eventId, ...body }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockReviewEntry } = vi.hoisted(() => ({
  mockReviewEntry: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  eventEntryRepository: { reviewEntry: mockReviewEntry },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  createRouteHandler: <B = unknown>(opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (b: unknown) => { success: boolean; data?: B; error?: { format: () => unknown } } };
    handler: (ctx: { request: Request; params?: unknown; user?: { uid: string; role: string }; body?: B }) => Promise<Response>;
  }) => {
    return async (request: Request, { params }: { params: unknown } = { params: {} }) => {
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

import { PATCH } from "../route";

const routeParams = { params: { id: "event-summer-holo-sale-2026", entryId: "entry-001" } };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockReviewEntry.mockResolvedValue(undefined);
});

describe("PATCH /api/admin/events/[id]/entries/[entryId]", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest({ status: "approved" }), routeParams as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PATCH(makeRequest({ status: "approved" }), routeParams as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeRequest({ status: "approved" }), routeParams as never);
    expect(res.status).toBe(200);
  });

  it("missing status → 400 (schema)", async () => {
    const res = await PATCH(makeRequest({}), routeParams as never);
    expect(res.status).toBe(400);
  });

  it("invalid status value → 400 (enum)", async () => {
    const res = await PATCH(makeRequest({ status: "INVALID" }), routeParams as never);
    expect(res.status).toBe(400);
  });

  it.each(["approved", "rejected", "flagged"])("valid status '%s' → 200", async (status) => {
    const res = await PATCH(makeRequest({ status }), routeParams as never);
    expect(res.status).toBe(200);
  });

  it("calls reviewEntry with entryId, status, user.uid, reviewNote, points", async () => {
    await PATCH(
      makeRequest({ status: "approved", reviewNote: "Good entry", points: 10 }),
      routeParams as never,
    );
    expect(mockReviewEntry).toHaveBeenCalledWith(
      "entry-001",
      "approved",
      "admin-uid",
      "Good entry",
      10,
    );
  });

  it("reviewNote and points optional — called with undefined when absent", async () => {
    await PATCH(makeRequest({ status: "rejected" }), routeParams as never);
    expect(mockReviewEntry).toHaveBeenCalledWith(
      "entry-001",
      "rejected",
      "admin-uid",
      undefined,
      undefined,
    );
  });

  it("returns { entryId, eventId, ...body } with 'Entry reviewed' message", async () => {
    const res = await PATCH(
      makeRequest({ status: "approved", reviewNote: "Good", points: 5 }),
      routeParams as never,
    );
    const json = await res.clone().json() as {
      message: string;
      data: { entryId: string; eventId: string; status: string; reviewNote: string; points: number };
    };
    expect(json.message).toBe("Entry reviewed");
    expect(json.data.entryId).toBe("entry-001");
    expect(json.data.eventId).toBe("event-summer-holo-sale-2026");
    expect(json.data.status).toBe("approved");
    expect(json.data.reviewNote).toBe("Good");
    expect(json.data.points).toBe(5);
  });
});
