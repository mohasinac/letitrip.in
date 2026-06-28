/**
 * Tests for GET /api/admin/newsletter/export
 *
 * Roles: ROLES_ADMIN_MOD
 * Returns CSV with headers: id, email, status, source, subscribedAt, createdAt
 * Content-Type: text/csv; charset=utf-8
 * Content-Disposition: attachment; filename="newsletter-subscribers-{date}.csv"
 * Values with commas/quotes escaped per CSV rules
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockList } = vi.hoisted(() => ({
  mockList: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_MOD: ["admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  newsletterRepository: { list: mockList },
  sortBy: (field: string) => field,
  COMMON_FIELDS: { CREATED_AT: "createdAt" },
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

import { GET } from "../route";

const mockData = [
  {
    id: "sub-001",
    email: "ravi@example.com",
    status: "active",
    source: "homepage",
    subscribedAt: "2026-01-01T00:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "sub-002",
    email: "alice,bob@example.com", // has comma — must be escaped
    status: "unsubscribed",
    source: "checkout",
    subscribedAt: "2026-02-01T00:00:00Z",
    createdAt: "2026-02-01T00:00:00Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockList.mockResolvedValue({ data: mockData });
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

  it("Content-Type is text/csv", async () => {
    const res = await GET(new Request("http://localhost/api/admin/newsletter/export") as never);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
  });

  it("Content-Disposition contains 'attachment' and filename", async () => {
    const res = await GET(new Request("http://localhost/api/admin/newsletter/export") as never);
    const cd = res.headers.get("Content-Disposition") ?? "";
    expect(cd).toContain("attachment");
    expect(cd).toContain("newsletter-subscribers-");
    expect(cd).toContain(".csv");
  });

  it("response body starts with CSV header row", async () => {
    const res = await GET(new Request("http://localhost/api/admin/newsletter/export") as never);
    const text = await res.text();
    const firstLine = text.split("\r\n")[0];
    expect(firstLine).toBe("id,email,status,source,subscribedAt,createdAt");
  });

  it("data rows include subscriber data", async () => {
    const res = await GET(new Request("http://localhost/api/admin/newsletter/export") as never);
    const text = await res.text();
    expect(text).toContain("sub-001");
    expect(text).toContain("ravi@example.com");
  });

  it("email with comma is wrapped in double quotes in output", async () => {
    const res = await GET(new Request("http://localhost/api/admin/newsletter/export") as never);
    const text = await res.text();
    expect(text).toContain('"alice,bob@example.com"');
  });

  it("calls list with pageSize 10000 to export all records", async () => {
    await GET(new Request("http://localhost/api/admin/newsletter/export") as never);
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: "10000" }),
    );
  });

  it("empty subscriber list → only header row", async () => {
    mockList.mockResolvedValue({ data: [] });
    const res = await GET(new Request("http://localhost/api/admin/newsletter/export") as never);
    const text = await res.text();
    const lines = text.split("\r\n").filter(Boolean);
    expect(lines).toHaveLength(1); // header only
  });
});
