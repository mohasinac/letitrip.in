/**
 * Tests for GET/PATCH/DELETE /api/admin/events/[id]
 *
 * GET: ROLES_ADMIN_MOD — uses eventRepository.list() with sieveFilter (NOT findById)
 *   → items[0]; not found → 404 via errorResponse
 * PATCH: ROLES_ADMIN_MOD — passthrough schema; startsAt/endsAt → Date objects
 * DELETE: ROLES_ADMIN_ONLY — calls changeStatus(id, "cancelled")
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockEventList,
  mockUpdateEvent,
  mockChangeStatus,
  mockSieveFilter,
} = vi.hoisted(() => ({
  mockEventList: vi.fn(),
  mockUpdateEvent: vi.fn(),
  mockChangeStatus: vi.fn(),
  mockSieveFilter: vi.fn((field: string, _op: string, value: string) => `${field}==${value}`),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  EVENT_FIELDS: {
    ID: "id",
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
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  eventRepository: {
    list: mockEventList,
    updateEvent: mockUpdateEvent,
    changeStatus: mockChangeStatus,
  },
  sieveFilter: mockSieveFilter,
  SIEVE_OP: { EQ: "==" },
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

      return opts.handler({ request, params, user: _user ?? undefined, body });
    };
  },
}));

import { GET, PATCH, DELETE } from "../route";

const params = { params: Promise.resolve({ id: "event-summer-holo-sale-2026" }) };

const mockEvent = {
  id: "event-summer-holo-sale-2026",
  title: "Summer Holo Sale 2026",
  status: "active",
  type: "sale",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockEventList.mockResolvedValue({ items: [mockEvent] });
  mockUpdateEvent.mockResolvedValue({ ...mockEvent, title: "Updated" });
  mockChangeStatus.mockResolvedValue(undefined);
});

describe("GET /api/admin/events/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("uses list() with sieveFilter (not findById)", async () => {
    await GET(new Request("http://localhost") as never, params as never);
    expect(mockEventList).toHaveBeenCalledWith(
      expect.objectContaining({ page: "1", pageSize: "1" }),
    );
    expect(mockSieveFilter).toHaveBeenCalledWith("id", "==", "event-summer-holo-sale-2026");
  });

  it("event not found → 404", async () => {
    mockEventList.mockResolvedValue({ items: [] });
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Event not found");
  });

  it("returns first item from list result", async () => {
    const res = await GET(new Request("http://localhost") as never, params as never);
    const json = await res.clone().json() as { data: { id: string } };
    expect(json.data.id).toBe("event-summer-holo-sale-2026");
  });
});

describe("PATCH /api/admin/events/[id]", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest({ title: "New Title" }), params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PATCH(makeRequest({ title: "New Title" }), params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PATCH(makeRequest({ title: "New Title" }), params as never);
    expect(res.status).toBe(200);
  });

  it("startsAt string → converted to Date object before update", async () => {
    await PATCH(
      makeRequest({ startsAt: "2026-07-01T00:00:00Z" }),
      params as never,
    );
    expect(mockUpdateEvent).toHaveBeenCalledWith(
      "event-summer-holo-sale-2026",
      expect.objectContaining({ startsAt: expect.any(Date) }),
    );
  });

  it("endsAt string → converted to Date object before update", async () => {
    await PATCH(
      makeRequest({ endsAt: "2026-08-31T23:59:59Z" }),
      params as never,
    );
    expect(mockUpdateEvent).toHaveBeenCalledWith(
      "event-summer-holo-sale-2026",
      expect.objectContaining({ endsAt: expect.any(Date) }),
    );
  });

  it("missing startsAt → field not included in update (not set to undefined)", async () => {
    await PATCH(makeRequest({ title: "New Title" }), params as never);
    const updateArg = mockUpdateEvent.mock.calls[0][1] as Record<string, unknown>;
    expect(updateArg).not.toHaveProperty("startsAt");
  });

  it("extra fields passed through (passthrough schema)", async () => {
    await PATCH(makeRequest({ title: "New", tags: ["promo"], status: "ended" }), params as never);
    expect(mockUpdateEvent).toHaveBeenCalledWith(
      "event-summer-holo-sale-2026",
      expect.objectContaining({ title: "New", tags: ["promo"], status: "ended" }),
    );
  });

  it("success → 200 with 'Event updated' message", async () => {
    const res = await PATCH(makeRequest({ title: "Updated" }), params as never);
    const json = await res.clone().json() as { message: string };
    expect(json.message).toBe("Event updated");
  });
});

describe("DELETE /api/admin/events/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(403);
  });

  it("calls changeStatus(id, 'cancelled')", async () => {
    await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(mockChangeStatus).toHaveBeenCalledWith("event-summer-holo-sale-2026", "cancelled");
  });

  it("success → 200 with 'Event cancelled' message", async () => {
    const res = await DELETE(
      new Request("http://localhost", { method: "DELETE" }) as never,
      params as never,
    );
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { message: string; data: null };
    expect(json.message).toBe("Event cancelled");
    expect(json.data).toBeNull();
  });
});
