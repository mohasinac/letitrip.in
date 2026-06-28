/**
 * Tests for GET /api/admin/events/[id]/entries
 *
 * Auth: requireRoleFromRequest(request, ["admin", "employee"]) — NOT createRouteHandler
 * Business logic:
 * - reviewStatus param → Sieve filter string (omitted or "all" → no filter)
 * - q param → in-memory filter on userDisplayName, userEmail, userId, id
 * - q match: total = filtered.length, totalPages = 1, hasMore = false
 * - no q: result returned as-is from listForEvent
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _shouldRejectRole = false;

const { mockListForEvent } = vi.hoisted(() => ({
  mockListForEvent: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@/lib/firebase/auth-server", () => ({
  requireRoleFromRequest: async () => {
    if (_shouldRejectRole) throw Object.assign(new Error("Forbidden"), { status: 403 });
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  eventEntryRepository: { listForEvent: mockListForEvent },
  successResponse: (data: unknown) => ({ ok: true, data }),
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
    const v = sp.has(key) ? Number(sp.get(key)) : def;
    if (opts?.min !== undefined && v < opts.min) return opts.min;
    if (opts?.max !== undefined && v > opts.max) return opts.max;
    return v;
  },
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key) ?? undefined,
  serverLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { GET } from "../route";

const makeResult = (items: Record<string, unknown>[] = []) => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
});

const params = { params: Promise.resolve({ id: "event-summer-holo-sale-2026" }) };

beforeEach(() => {
  vi.clearAllMocks();
  _shouldRejectRole = false;
  mockListForEvent.mockResolvedValue(
    makeResult([
      { id: "entry-001", userId: "user-ravi", userDisplayName: "Ravi Kumar", userEmail: "ravi@example.com" },
      { id: "entry-002", userId: "user-priya", userDisplayName: "Priya Sharma", userEmail: "priya@example.com" },
    ]),
  );
});

describe("GET /api/admin/events/[id]/entries", () => {
  const makeRequest = (qs = "") =>
    new Request(`http://localhost/api/admin/events/event-summer-holo-sale-2026/entries${qs ? `?${qs}` : ""}`) as never;

  it("forbidden role (non-admin/employee) → requireRoleFromRequest throws → propagates 403 error", async () => {
    _shouldRejectRole = true;
    await expect(GET(makeRequest(), params as never)).rejects.toThrow("Forbidden");
  });

  it("admin → succeeds (no throw from requireRoleFromRequest)", async () => {
    _shouldRejectRole = false;
    const res = await GET(makeRequest(), params as never);
    expect(res.status).toBe(200);
  });

  it("calls listForEvent with the correct eventId", async () => {
    await GET(makeRequest(), params as never);
    expect(mockListForEvent).toHaveBeenCalledWith(
      "event-summer-holo-sale-2026",
      expect.any(Object),
    );
  });

  it("default page=1, pageSize=50", async () => {
    await GET(makeRequest(), params as never);
    expect(mockListForEvent).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ page: 1, pageSize: 50 }),
    );
  });

  it("reviewStatus param → filters string passed to listForEvent", async () => {
    await GET(makeRequest("reviewStatus=approved"), params as never);
    expect(mockListForEvent).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ filters: "reviewStatus==approved" }),
    );
  });

  it("reviewStatus=all → no filter (undefined)", async () => {
    await GET(makeRequest("reviewStatus=all"), params as never);
    expect(mockListForEvent).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ filters: undefined }),
    );
  });

  it("no reviewStatus → no filter (undefined)", async () => {
    await GET(makeRequest(), params as never);
    expect(mockListForEvent).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ filters: undefined }),
    );
  });

  it("no q → returns full result as-is from listForEvent", async () => {
    const res = await GET(makeRequest(), params as never);
    const json = await res.clone().json() as { ok: boolean; data: { items: unknown[]; total: number } };
    expect(json.data.items).toHaveLength(2);
    expect(json.data.total).toBe(2);
  });

  it("q matches userDisplayName → only matching entries returned", async () => {
    const res = await GET(makeRequest("q=ravi"), params as never);
    const json = await res.clone().json() as { data: { items: { userDisplayName: string }[]; total: number } };
    expect(json.data.items).toHaveLength(1);
    expect(json.data.items[0].userDisplayName).toBe("Ravi Kumar");
    expect(json.data.total).toBe(1);
  });

  it("q matches userEmail → only matching entries returned", async () => {
    const res = await GET(makeRequest("q=priya%40example"), params as never);
    const json = await res.clone().json() as { data: { items: { userEmail: string }[]; total: number } };
    expect(json.data.items).toHaveLength(1);
    expect(json.data.items[0].userEmail).toBe("priya@example.com");
  });

  it("q matches userId → only matching entries returned", async () => {
    const res = await GET(makeRequest("q=user-ravi"), params as never);
    const json = await res.clone().json() as { data: { items: unknown[] } };
    expect(json.data.items).toHaveLength(1);
  });

  it("q matches entryId → only matching entries returned", async () => {
    const res = await GET(makeRequest("q=entry-002"), params as never);
    const json = await res.clone().json() as { data: { items: unknown[] } };
    expect(json.data.items).toHaveLength(1);
  });

  it("q matches case-insensitively", async () => {
    const res = await GET(makeRequest("q=RAVI"), params as never);
    const json = await res.clone().json() as { data: { items: unknown[] } };
    expect(json.data.items).toHaveLength(1);
  });

  it("q with no matches → empty items, total=0", async () => {
    const res = await GET(makeRequest("q=nobody"), params as never);
    const json = await res.clone().json() as { data: { items: unknown[]; total: number; hasMore: boolean; totalPages: number } };
    expect(json.data.items).toHaveLength(0);
    expect(json.data.total).toBe(0);
    expect(json.data.hasMore).toBe(false);
    expect(json.data.totalPages).toBe(1);
  });

  it("q applied → totalPages=1, hasMore=false regardless of original pagination", async () => {
    mockListForEvent.mockResolvedValue({
      items: [
        { id: "entry-001", userId: "user-ravi", userDisplayName: "Ravi Kumar", userEmail: "ravi@example.com" },
      ],
      total: 100,
      page: 1,
      pageSize: 50,
      totalPages: 2,
      hasMore: true,
    });
    const res = await GET(makeRequest("q=ravi"), params as never);
    const json = await res.clone().json() as { data: { hasMore: boolean; totalPages: number } };
    expect(json.data.hasMore).toBe(false);
    expect(json.data.totalPages).toBe(1);
  });
});
