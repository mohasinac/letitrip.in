/**
 * Tests for GET + POST /api/admin/events
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockEventList,
  mockCreateEvent,
  mockFinalizeStagedMediaField,
  mockFinalizeStagedMediaObject,
  mockFinalizeStagedMediaObjectArray,
} = vi.hoisted(() => ({
  mockEventList: vi.fn(),
  mockCreateEvent: vi.fn(),
  mockFinalizeStagedMediaField: vi.fn((v: unknown) => Promise.resolve(v)),
  mockFinalizeStagedMediaObject: vi.fn((v: unknown) => Promise.resolve(v)),
  mockFinalizeStagedMediaObjectArray: vi.fn((v: unknown) => Promise.resolve(v)),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
  EVENT_FIELDS: { CREATED_AT: "createdAt", STATUS_VALUES: { DRAFT: "draft" } },
}));

vi.mock("@mohasinac/appkit", () => ({
  eventRepository: { list: mockEventList, createEvent: mockCreateEvent },
  finalizeStagedMediaField: mockFinalizeStagedMediaField,
  finalizeStagedMediaObject: mockFinalizeStagedMediaObject,
  finalizeStagedMediaObjectArray: mockFinalizeStagedMediaObjectArray,
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
    const v = Number(sp.get(key)) || def;
    if (opts?.min !== undefined && v < opts.min) return opts.min;
    if (opts?.max !== undefined && v > opts.max) return opts.max;
    return v;
  },
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key) ?? undefined,
  sortBy: (field: string) => `-${field}`,
  successResponse: (data: unknown, _msg?: string, status = 200) =>
    new Response(JSON.stringify({ ok: true, data }), { status }),
  ERROR_MESSAGES: { VALIDATION: { REQUIRED_FIELD: "Required" } },
  SUCCESS_MESSAGES: { EVENT: { CREATED: "Event created" } },
  serverLogger: { info: vi.fn(), error: vi.fn() },
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    permission?: string;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; request: Request }) => Promise<Response>;
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
        if (!result.success) {
          const msg = result.error?.issues[0]?.message ?? "Validation error";
          return new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 });
        }
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, request });
    };
  },
}));

import { GET, POST } from "../route";

const pagedResult = {
  items: [{ id: "event-1", type: "sale", status: "draft" }],
  total: 1,
  page: 1,
  pageSize: 25,
  totalPages: 1,
  hasMore: false,
};

const validEventBody = {
  type: "sale",
  title: "Summer Sale",
  description: "Big sale",
  startsAt: "2026-07-01T00:00:00+05:30",
  endsAt: "2026-07-31T23:59:59+05:30",
  saleConfig: { discountPercent: 20, bannerText: "20% off!" },
};

const makeGetReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/admin/events");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/admin/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockEventList.mockResolvedValue(pagedResult);
  mockCreateEvent.mockResolvedValue({ id: "event-new", type: "sale", status: "draft" });
});

describe("GET /api/admin/events", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("seller role → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("type filter applied as Sieve filter", async () => {
    await GET(makeGetReq({ type: "sale" }) as never);
    const callArg = mockEventList.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("type==sale");
  });

  it("status filter applied as Sieve filter", async () => {
    await GET(makeGetReq({ status: "active" }) as never);
    const callArg = mockEventList.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("status==active");
  });

  it("returns events list with pagination", async () => {
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number } };
    expect(json.data.total).toBe(1);
  });
});

describe("POST /api/admin/events", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq(validEventBody) as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (admin-only)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makePostReq(validEventBody) as never);
    expect(res.status).toBe(403);
  });

  it("missing title → 400", async () => {
    const { title: _, ...bodyWithoutTitle } = validEventBody;
    const res = await POST(makePostReq(bodyWithoutTitle) as never);
    expect(res.status).toBe(400);
  });

  it("event created with status: draft (forced)", async () => {
    await POST(makePostReq(validEventBody) as never);
    expect(mockCreateEvent).toHaveBeenCalledWith(
      expect.objectContaining({ status: "draft" }),
    );
  });

  it("createdBy set to admin uid", async () => {
    await POST(makePostReq(validEventBody) as never);
    expect(mockCreateEvent).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: "admin-uid" }),
    );
  });

  it("startsAt and endsAt converted to Date objects", async () => {
    await POST(makePostReq(validEventBody) as never);
    const call = mockCreateEvent.mock.calls[0][0] as { startsAt: unknown; endsAt: unknown };
    expect(call.startsAt instanceof Date).toBe(true);
    expect(call.endsAt instanceof Date).toBe(true);
  });

  it("success → 201 with event data", async () => {
    const res = await POST(makePostReq(validEventBody) as never);
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { ok: boolean; data: { id: string } };
    expect(json.ok).toBe(true);
    expect(json.data.id).toBe("event-new");
  });
});
