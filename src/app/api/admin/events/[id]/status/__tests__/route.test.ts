/**
 * Tests for PATCH /api/admin/events/[id]/status
 *
 * Roles: ROLES_ADMIN_MOD
 * Permission: admin:events:write
 * Schema: { status: z.enum([draft, published, active, ended, cancelled, paused]) }
 * Calls eventRepository.changeStatus(id, status)
 * Returns { id, status }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockChangeStatus } = vi.hoisted(() => ({
  mockChangeStatus: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  EVENT_FIELDS: {
    STATUS_VALUES: {
      DRAFT: "draft",
      PUBLISHED: "published",
      ACTIVE: "active",
      ENDED: "ended",
      CANCELLED: "cancelled",
      PAUSED: "paused",
    },
  },
  ROLES_ADMIN_MOD: ["admin", "moderator"],
}));

vi.mock("@mohasinac/appkit", () => ({
  eventRepository: { changeStatus: mockChangeStatus },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  createRouteHandler: <B = unknown>(opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (b: unknown) => { success: boolean; data?: B; error?: { format: () => unknown } } };
    handler: (ctx: { params?: unknown; body?: B }) => Promise<Response>;
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
        if (!parsed.success)
          return new Response(JSON.stringify({ ok: false }), { status: 400 });
        body = parsed.data;
      }

      return opts.handler({ params, body });
    };
  },
}));

import { PATCH } from "../route";

const params = { params: Promise.resolve({ id: "event-summer-holo-sale-2026" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockChangeStatus.mockResolvedValue(undefined);
});

describe("PATCH /api/admin/events/[id]/status", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest({ status: "active" }), params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PATCH(makeRequest({ status: "active" }), params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeRequest({ status: "active" }), params as never);
    expect(res.status).toBe(200);
  });

  it("invalid status value → 400", async () => {
    const res = await PATCH(makeRequest({ status: "INVALID_STATUS" }), params as never);
    expect(res.status).toBe(400);
  });

  it("missing status → 400", async () => {
    const res = await PATCH(makeRequest({}), params as never);
    expect(res.status).toBe(400);
  });

  it.each(["draft", "published", "active", "ended", "cancelled", "paused"])(
    "valid status '%s' → 200",
    async (status) => {
      const res = await PATCH(makeRequest({ status }), params as never);
      expect(res.status).toBe(200);
    },
  );

  it("calls changeStatus with event id and status", async () => {
    await PATCH(makeRequest({ status: "ended" }), params as never);
    expect(mockChangeStatus).toHaveBeenCalledWith("event-summer-holo-sale-2026", "ended");
  });

  it("returns { id, status } in response", async () => {
    const res = await PATCH(makeRequest({ status: "ended" }), params as never);
    const json = await res.clone().json() as { data: { id: string; status: string } };
    expect(json.data.id).toBe("event-summer-holo-sale-2026");
    expect(json.data.status).toBe("ended");
  });

  it("returns 'Event status updated' message", async () => {
    const res = await PATCH(makeRequest({ status: "paused" }), params as never);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toBe("Event status updated");
  });
});
