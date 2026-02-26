/**
 * @jest-environment node
 */

/**
 * Admin Events API Tests
 *
 * GET    /api/admin/events            — Paginated list with Sieve
 * POST   /api/admin/events            — Create event
 * GET    /api/admin/events/[id]       — Get by ID
 * PUT    /api/admin/events/[id]       — Update
 * DELETE /api/admin/events/[id]       — Delete (hard for draft / soft for active)
 * PATCH  /api/admin/events/[id]/status — Change status
 * GET    /api/admin/events/[id]/stats  — Stats aggregation
 */

import {
  buildRequest,
  parseResponse,
  mockAdminUser,
  mockRegularUser,
} from "./helpers";

// ─── createApiHandler stub ────────────────────────────────────────────────────

jest.mock("@/lib/api/api-handler", () => ({
  createApiHandler: (opts: any) => {
    return async (req: any, ctx?: any) => {
      const { NextResponse } = require("next/server");
      const user = (global as any).__mockAdminEventsUser ?? null;
      if (opts.auth && !user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }
      const requiredRoles: string[] = opts.roles ?? [];
      if (requiredRoles.length && user && !requiredRoles.includes(user.role)) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
      let body: any = undefined;
      if (opts.schema) {
        try {
          const rawBody = await req.json().catch(() => ({}));
          const result = opts.schema.safeParse(rawBody);
          if (!result.success) {
            return NextResponse.json(
              {
                success: false,
                error: "Validation failed",
                errors: result.error.issues,
              },
              { status: 422 },
            );
          }
          body = result.data;
        } catch {
          body = undefined;
        }
      }
      try {
        return await opts.handler({ request: req, user, body }, ctx);
      } catch (error: any) {
        const status = error?.statusCode || 500;
        return NextResponse.json(
          { success: false, error: error?.message || "Internal error" },
          { status },
        );
      }
    };
  },
}));

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockEventList = jest.fn();
const mockEventFindById = jest.fn();
const mockEventCreate = jest.fn();
const mockEventUpdate = jest.fn();
const mockEventDelete = jest.fn();
const mockEventChangeStatus = jest.fn();
const mockEntriesListForEvent = jest.fn();

jest.mock("@/repositories", () => ({
  eventRepository: {
    list: (...args: unknown[]) => mockEventList(...args),
    findById: (...args: unknown[]) => mockEventFindById(...args),
    createEvent: (...args: unknown[]) => mockEventCreate(...args),
    updateEvent: (...args: unknown[]) => mockEventUpdate(...args),
    delete: (...args: unknown[]) => mockEventDelete(...args),
    changeStatus: (...args: unknown[]) => mockEventChangeStatus(...args),
  },
  eventEntryRepository: {
    listForEvent: (...args: unknown[]) => mockEntriesListForEvent(...args),
  },
}));

// ─── Route imports (after mocks) ─────────────────────────────────────────────

import { GET as listEvents, POST as createEvent } from "../admin/events/route";
import {
  GET as getEvent,
  PUT as updateEvent,
  DELETE as deleteEvent,
} from "../admin/events/[id]/route";
import { PATCH as changeStatus } from "../admin/events/[id]/status/route";
import { GET as getStats } from "../admin/events/[id]/stats/route";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BASE = "http://localhost:3000/api/admin/events";

function setUser(user: any) {
  (global as any).__mockAdminEventsUser = user;
}

const mockEvent = {
  id: "evt_1",
  type: "poll",
  title: "Spring Poll",
  description: "",
  status: "draft",
  createdBy: "admin-uid-001",
  startsAt: new Date("2026-05-01"),
  endsAt: new Date("2026-05-31"),
  stats: { totalEntries: 0, approvedEntries: 0, flaggedEntries: 0 },
  pollConfig: {
    allowMultiSelect: false,
    allowComment: false,
    options: [
      { id: "opt_1", label: "Option A" },
      { id: "opt_2", label: "Option B" },
    ],
    resultsVisibility: "after_end",
  },
};

// ─── GET /api/admin/events ────────────────────────────────────────────────────

describe("GET /api/admin/events", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setUser(mockAdminUser());
    mockEventList.mockResolvedValue({
      items: [mockEvent],
      total: 1,
      page: 1,
      pageSize: 25,
      totalPages: 1,
      hasMore: false,
    });
  });

  it("returns 401 without session", async () => {
    setUser(null);
    const req = buildRequest(BASE);
    const res = await listEvents(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(401);
  });

  it("returns 403 for non-admin role", async () => {
    setUser(mockRegularUser());
    const req = buildRequest(BASE);
    const res = await listEvents(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(403);
  });

  it("returns 200 with paginated events", async () => {
    const req = buildRequest(BASE);
    const res = await listEvents(req);
    const { status, body } = await parseResponse(res);
    expect(status).toBe(200);
    expect(body.data).toHaveProperty("items");
    expect(Array.isArray(body.data.items)).toBe(true);
    expect(body.data.total).toBe(1);
  });

  it("passes Sieve model to repository.list()", async () => {
    const req = buildRequest(
      `${BASE}?page=2&pageSize=10&sorts=-title&status=active`,
    );
    await listEvents(req);
    expect(mockEventList).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 10, sorts: "-title" }),
    );
  });
});

// ─── POST /api/admin/events ───────────────────────────────────────────────────

describe("POST /api/admin/events", () => {
  const validBody = {
    type: "poll",
    title: "Spring Poll",
    startsAt: "2026-05-01T00:00:00.000Z",
    endsAt: "2026-05-31T23:59:59.000Z",
    pollConfig: {
      allowMultiSelect: false,
      allowComment: false,
      options: [
        { id: "opt_1", label: "Option A" },
        { id: "opt_2", label: "Option B" },
      ],
      resultsVisibility: "after_end",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setUser(mockAdminUser());
    mockEventCreate.mockResolvedValue({ ...mockEvent, id: "evt_new" });
  });

  it("returns 401 without session", async () => {
    setUser(null);
    const req = buildRequest(BASE, { method: "POST", body: validBody });
    const res = await createEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(401);
  });

  it("returns 403 for non-admin role", async () => {
    setUser(mockRegularUser());
    const req = buildRequest(BASE, { method: "POST", body: validBody });
    const res = await createEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(403);
  });

  it("returns 422 for invalid payload (missing title)", async () => {
    const req = buildRequest(BASE, {
      method: "POST",
      body: {
        type: "poll",
        startsAt: "2026-05-01T00:00:00.000Z",
        endsAt: "2026-05-31T23:59:59.000Z",
      },
    });
    const res = await createEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(422);
  });

  it("returns 201 on successful creation", async () => {
    const req = buildRequest(BASE, { method: "POST", body: validBody });
    const res = await createEvent(req);
    const { status, body } = await parseResponse(res);
    expect(status).toBe(201);
    expect(body.data).toHaveProperty("id", "evt_new");
  });
});

// ─── GET /api/admin/events/[id] ────────────────────────────────────────────────

describe("GET /api/admin/events/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setUser(mockAdminUser());
  });

  it("returns 401 without session", async () => {
    setUser(null);
    const req = buildRequest(`${BASE}/evt_1`);
    const res = await getEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(401);
  });

  it("returns 404 when event not found", async () => {
    mockEventFindById.mockResolvedValue(null);
    const req = buildRequest(`${BASE}/unknown`);
    const res = await getEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(404);
  });

  it("returns 200 with event data", async () => {
    mockEventFindById.mockResolvedValue(mockEvent);
    const req = buildRequest(`${BASE}/evt_1`);
    const res = await getEvent(req);
    const { status, body } = await parseResponse(res);
    expect(status).toBe(200);
    expect(body.data).toHaveProperty("id", "evt_1");
  });
});

// ─── PUT /api/admin/events/[id] ────────────────────────────────────────────────

describe("PUT /api/admin/events/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setUser(mockAdminUser());
  });

  it("returns 401 without session", async () => {
    setUser(null);
    const req = buildRequest(`${BASE}/evt_1`, {
      method: "PUT",
      body: { title: "Updated" },
    });
    const res = await updateEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(401);
  });

  it("returns 404 when event not found", async () => {
    mockEventFindById.mockResolvedValue(null);
    const req = buildRequest(`${BASE}/unknown`, {
      method: "PUT",
      body: { title: "Updated" },
    });
    const res = await updateEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(404);
  });

  it("returns 200 on successful update", async () => {
    mockEventFindById.mockResolvedValue(mockEvent);
    mockEventUpdate.mockResolvedValue({ ...mockEvent, title: "Updated" });
    const req = buildRequest(`${BASE}/evt_1`, {
      method: "PUT",
      body: { title: "Updated" },
    });
    const res = await updateEvent(req);
    const { status, body } = await parseResponse(res);
    expect(status).toBe(200);
    expect(body.data).toHaveProperty("title", "Updated");
  });
});

// ─── DELETE /api/admin/events/[id] ─────────────────────────────────────────────

describe("DELETE /api/admin/events/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setUser(mockAdminUser());
  });

  it("returns 401 without session", async () => {
    setUser(null);
    const req = buildRequest(`${BASE}/evt_1`, { method: "DELETE" });
    const res = await deleteEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(401);
  });

  it("returns 404 when event not found", async () => {
    mockEventFindById.mockResolvedValue(null);
    const req = buildRequest(`${BASE}/unknown`, { method: "DELETE" });
    const res = await deleteEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(404);
  });

  it("hard-deletes draft events", async () => {
    mockEventFindById.mockResolvedValue(mockEvent); // status: "draft"
    mockEventDelete.mockResolvedValue(undefined);
    const req = buildRequest(`${BASE}/evt_1`, { method: "DELETE" });
    const res = await deleteEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(200);
    expect(mockEventDelete).toHaveBeenCalledWith("evt_1");
  });

  it("soft-deletes (sets ended) active events", async () => {
    mockEventFindById.mockResolvedValue({ ...mockEvent, status: "active" });
    mockEventChangeStatus.mockResolvedValue({ ...mockEvent, status: "ended" });
    const req = buildRequest(`${BASE}/evt_1`, { method: "DELETE" });
    const res = await deleteEvent(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(200);
    expect(mockEventChangeStatus).toHaveBeenCalledWith("evt_1", "ended");
  });
});

// ─── PATCH /api/admin/events/[id]/status ────────────────────────────────────────

describe("PATCH /api/admin/events/[id]/status", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setUser(mockAdminUser());
  });

  it("returns 401 without session", async () => {
    setUser(null);
    const req = buildRequest(`${BASE}/evt_1/status`, {
      method: "PATCH",
      body: { status: "active" },
    });
    const res = await changeStatus(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(401);
  });

  it("returns 404 when event not found", async () => {
    mockEventFindById.mockResolvedValue(null);
    const req = buildRequest(`${BASE}/unknown/status`, {
      method: "PATCH",
      body: { status: "active" },
    });
    const res = await changeStatus(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(404);
  });

  it("returns 400 for invalid status transition (ended → active)", async () => {
    mockEventFindById.mockResolvedValue({ ...mockEvent, status: "ended" });
    const req = buildRequest(`${BASE}/evt_1/status`, {
      method: "PATCH",
      body: { status: "active" },
    });
    const res = await changeStatus(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(400);
  });

  it("returns 200 on valid transition (draft → active)", async () => {
    mockEventFindById.mockResolvedValue({ ...mockEvent, status: "draft" });
    mockEventChangeStatus.mockResolvedValue({ ...mockEvent, status: "active" });
    const req = buildRequest(`${BASE}/evt_1/status`, {
      method: "PATCH",
      body: { status: "active" },
    });
    const res = await changeStatus(req);
    const { status, body } = await parseResponse(res);
    expect(status).toBe(200);
    expect(mockEventChangeStatus).toHaveBeenCalledWith("evt_1", "active");
  });
});

// ─── GET /api/admin/events/[id]/stats ────────────────────────────────────────────

describe("GET /api/admin/events/[id]/stats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setUser(mockAdminUser());
  });

  it("returns 401 without session", async () => {
    setUser(null);
    const req = buildRequest(`${BASE}/evt_1/stats`);
    const res = await getStats(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(401);
  });

  it("returns 404 when event not found", async () => {
    mockEventFindById.mockResolvedValue(null);
    const req = buildRequest(`${BASE}/unknown/stats`);
    const res = await getStats(req);
    const { status } = await parseResponse(res);
    expect(status).toBe(404);
  });

  it("returns 200 with stats summary", async () => {
    mockEventFindById.mockResolvedValue({
      ...mockEvent,
      stats: { totalEntries: 10, approvedEntries: 8, flaggedEntries: 1 },
    });
    // Poll stats route also fetches entries to compute vote tallies
    mockEntriesListForEvent.mockResolvedValue({ items: [], total: 0 });
    const req = buildRequest(`${BASE}/evt_1/stats`);
    const res = await getStats(req);
    const { status, body } = await parseResponse(res);
    expect(status).toBe(200);
    expect(body.data).toBeDefined();
  });
});
